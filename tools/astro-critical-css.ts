// import { AstroIntegration } from "astro" // (inutile en runtime)
import puppeteer, { Page } from "puppeteer"
import fs from "fs/promises"
import path from "path"
import { PurgeCSS } from "purgecss"

/**
 * Plugin Astro pour extraire et injecter le CSS critique dans chaque page après le build.
 * Utilise Puppeteer pour rendre chaque page à la taille 1440x865 et extraire le CSS visible.
 * Modifie aussi les balises <link rel="stylesheet"> pour appliquer le lazy loading.
 */
const astroCriticalCss = () => {
	async function getCriticalHTML(page: Page): Promise<string> {
		const criticalHTML = await page.evaluate(() => {
			/**
			 * @description Check if an element is in the viewport
			 * @param element The element to check
			 * @returns true if the element is in the viewport, false otherwise
			 */
			const isElementInViewport = (element: Element): boolean => {
				const rect = element.getBoundingClientRect()
				return (
					((rect.top < window.innerHeight && rect.top >= 0) ||
						(rect.top <= 0 && rect.bottom >= 0)) &&
					((rect.left < window.innerWidth && rect.left >= 0) ||
						(rect.left <= 0 && rect.right >= 0))
				)
			}

			const mapAttributes = (element: Element): string => {
				return Array.from(element.attributes)
					.map((attr) => `${attr.name}="${attr.value}"`)
					.join(" ")
			}

			// Collect all elements in the body
			const elements = document.querySelectorAll("body *")
			const htmlElement = document.documentElement
			const bodyElement = document.body

			let html = `<html ${mapAttributes(htmlElement)}><head></head><body ${mapAttributes(bodyElement)}>`

			Array.from(elements).forEach((element) => {
				if (isElementInViewport(element)) {
					const tag = element.tagName.toLowerCase()
					html += `<${tag} ${mapAttributes(element)}></${tag}>`
				}
			})

			html += "</body></html>"
			return html
		})

		return criticalHTML
	}

	async function extractCriticalCss(
		fictionalHtml: string,
		cssContents: string[],
	): Promise<string> {
		// Get all CSS
		// let cssGlobal = ''
		// cssIds.forEach((id) => {
		// 	const cssFile = cssContents.find((item) => item.id === id)
		// 	if (cssFile) {
		// 		cssGlobal += cssFile.content
		// 	}
		// })

		// Use purgeCSS to extract only the critical CSS
		const purgeCSSResults = await new PurgeCSS().purge({
			content: [{ raw: fictionalHtml, extension: "html" }],
			css: [{ raw: cssContents.join("\n") }],
			defaultExtractor: (content) => {
				const defaultSelectors = content.match(/[A-Za-z0-9_-]+/g) || []
				const extendedSelectors = content.match(/[^<>"=\s]+/g) || []
				return [...defaultSelectors, ...extendedSelectors]
			},
			safelist: {
				standard: ["html", "body", "*", "::before", "::after"],
				deep: [],
				greedy: [/\\\[.*?\\\]/, /-\\\[.*?\\\]/],
			},
		})

		let criticalCSS = purgeCSSResults[0]?.css || ""

		// OPTIMISATION : supprimer les variables CSS inutilisées
		// 1. Trouver toutes les variables utilisées dans le critical CSS
		const usedVars = new Set(
			Array.from(criticalCSS.matchAll(/var\((--[\w-]+)/g)).map((m) => m[1]),
		)

		// 2. Supprimer les déclarations inutilisées dans :root et autres
		criticalCSS = criticalCSS.replace(
			/(:root|html|body)\s*{([^}]*)}/g,
			(block, selector, content) => {
				// Pour chaque déclaration de variable dans ce bloc
				const kept = []
				for (const decl of content.split(";")) {
					const match = decl.match(/(--[\w-]+)\s*:/)
					if (match) {
						if (usedVars.has(match[1])) {
							kept.push(decl)
						}
					} else if (decl.trim()) {
						// Garder les autres propriétés (non variables)
						kept.push(decl)
					}
				}
				if (kept.length === 0) return ""
				return `${selector}{${kept.join(";")}}`
			},
		)

		return criticalCSS
	}
	// Fonction pour trouver le chemin de Chrome/Chromium local sur macOS
	async function findChrome(): Promise<string | null> {
		const possiblePaths = [
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
			"/Applications/Chromium.app/Contents/MacOS/Chromium",
			"/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
		]
		for (const p of possiblePaths) {
			try {
				await fs.access(p)
				return p
			} catch {}
		}
		return null
	}
	// Fonction utilitaire pour lister tous les fichiers HTML dans un dossier (récursif)
	async function getHtmlFiles(dirPath: string): Promise<string[]> {
		const entries = await fs.readdir(dirPath, { withFileTypes: true })
		const files = await Promise.all(
			entries.map(async (entry) => {
				const res = path.resolve(dirPath, entry.name)
				if (entry.isDirectory()) {
					return getHtmlFiles(res)
				} else if (entry.isFile() && res.endsWith(".html")) {
					return [res]
				} else {
					return []
				}
			}),
		)
		return files.flat()
	}

	return {
		name: "astro-critical-css",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				const outDir = dir.pathname
				const chromePath = await findChrome()
				if (!chromePath) {
					throw new Error(
						"Chrome/Chromium non trouvé sur ce système. Installez Google Chrome.",
					)
				}
				const browser = await puppeteer.launch({ executablePath: chromePath })
				try {
					const htmlFiles = await getHtmlFiles(outDir)
					// Pour chaque fichier HTML, on traitera la suite
					for (const htmlFile of htmlFiles) {
						// Lire le contenu HTML
						let html = await fs.readFile(htmlFile, "utf-8")

						// Créer une page Puppeteer et servir le fichier localement
						const page = await browser.newPage()
						await page.setViewport({ width: 1440, height: 865 })

						// Charger le HTML dans Puppeteer
						await page.setContent(html, { waitUntil: "networkidle0" })

						// 1. Récupérer les href des <link rel="stylesheet">
						const cssHrefs: string[] = await page.evaluate(() => {
							return Array.from(
								document.querySelectorAll('link[rel="stylesheet"]'),
							).map((link) => (link as HTMLLinkElement).href)
						})

						// 2. Lire les fichiers CSS localement (en ignorant les URLs externes)
						const cssContents: string[] = []
						for (const href of cssHrefs) {
							// On suppose que les href sont relatifs au dossier public ou build
							let cssPath = href
							if (cssPath.startsWith("http")) {
								// Ignore les CSS externes
								continue
							}
							// Corrige le chemin pour le build Astro
							if (cssPath.startsWith("/")) {
								cssPath = path.join(outDir, cssPath)
							} else {
								cssPath = path.join(path.dirname(htmlFile), cssPath)
							}
							try {
								const css = await fs.readFile(cssPath, "utf-8")
								cssContents.push(css)
							} catch (e) {
								// Ignore si le fichier n'existe pas
							}
						}
						const criticalHTML = await getCriticalHTML(page)
						const criticalCss = await extractCriticalCss(
							criticalHTML,
							cssContents,
						)
						// // 3. Récupérer les sélecteurs des éléments visibles dans le viewport
						// const usedSelectors: string[] = await page.evaluate(() => {
						// 	const selectors = new Set<string>()
						// 	const viewportWidth = window.innerWidth
						// 	const viewportHeight = window.innerHeight
						// 	const elements = Array.from(document.querySelectorAll("*"))
						// 	for (const el of elements) {
						// 		const rect = (el as HTMLElement).getBoundingClientRect()
						// 		// Vérifie si l'élément est dans le viewport
						// 		if (
						// 			rect.bottom > 0 &&
						// 			rect.right > 0 &&
						// 			rect.top < viewportHeight &&
						// 			rect.left < viewportWidth &&
						// 			rect.width > 0 &&
						// 			rect.height > 0 &&
						// 			window.getComputedStyle(el).display !== "none" &&
						// 			window.getComputedStyle(el).visibility !== "hidden"
						// 		) {
						// 			if (el.id) selectors.add(`#${el.id}`)
						// 			for (const cls of el.classList) selectors.add(`.${cls}`)
						// 			selectors.add(el.tagName.toLowerCase())
						// 		}
						// 	}
						// 	return Array.from(selectors)
						// })

						// // 4. Filtrer les règles CSS pour ne garder que celles qui s'appliquent à au moins un élément visible dans le viewport
						// const criticalCss: string[] = []
						// for (const css of cssContents) {
						// 	// Découpe grossièrement en règles
						// 	const rules = css.split("}")
						// 	for (let rule of rules) {
						// 		rule = rule.trim()
						// 		if (!rule) continue
						// 		const selector = rule.split("{")[0]?.trim()
						// 		const body = rule.split("{")[1]?.trim()
						// 		if (!selector || !body) continue
						// 		// Pour chaque sélecteur (peut être une liste)
						// 		const selectors = selector
						// 			.split(",")
						// 			.map((s) => s.trim())
						// 			.filter(Boolean)
						// 		let keep = false
						// 		for (const sel of selectors) {
						// 			// Vérifie dans le viewport si un élément visible correspond à ce sélecteur
						// 			const isVisible = await page.evaluate((sel) => {
						// 				try {
						// 					const els = Array.from(document.querySelectorAll(sel))
						// 					const viewportWidth = window.innerWidth
						// 					const viewportHeight = window.innerHeight
						// 					for (const el of els) {
						// 						const rect = (el as HTMLElement).getBoundingClientRect()
						// 						if (
						// 							rect.bottom > 0 &&
						// 							rect.right > 0 &&
						// 							rect.top < viewportHeight &&
						// 							rect.left < viewportWidth &&
						// 							rect.width > 0 &&
						// 							rect.height > 0 &&
						// 							window.getComputedStyle(el).display !== "none" &&
						// 							window.getComputedStyle(el).visibility !== "hidden"
						// 						) {
						// 							return true
						// 						}
						// 					}
						// 				} catch {}
						// 				return false
						// 			}, sel)
						// 			if (isVisible) {
						// 				keep = true
						// 				break
						// 			}
						// 		}
						// 		if (keep) {
						// 			criticalCss.push(selector + " {" + body + "}")
						// 		}
						// 	}
						// }
						// const criticalCssStr = criticalCss.join("\n")

						// Injecter le CSS critique dans le <head>
						html = html.replace(
							/<head(.*?)>/i,
							`<head$1>\n<style id="critical-css">${criticalCss}</style>`,
						)

						// Modifier les balises <link rel="stylesheet"> pour lazy loading
						html = html.replace(
							/<link([^>]*?)rel=["']stylesheet["']([^>]*?)>/gi,
							(match, before, after) => {
								// Ajoute les attributs nécessaires pour le lazy loading
								let hrefMatch = match.match(/href=["']([^"']+)["']/)
								let href = hrefMatch ? hrefMatch[1] : ""
								let idMatch = match.match(/id=["']([^"']+)["']/)
								let id = idMatch ? idMatch[1] : ""
								let idAttr = id ? `id="${id}"` : ""
								return `<link as=style href=${href} ${idAttr} onload="this.onload=null; this.isLoaded=true; this.rel='stylesheet';" rel=stylesheet>`
							},
						)

						// Écrire le fichier modifié
						await fs.writeFile(htmlFile, html, "utf-8")
						await page.close()
					}
				} finally {
					await browser.close()
				}
			},
		},
	}
}

export default astroCriticalCss
