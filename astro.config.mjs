// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import sitemap from "@astrojs/sitemap"
import { loadEnv } from "vite"
// import criticalCss from "astro-critical-css"

import mdx from "@astrojs/mdx"
import mdxClasses from "./config/mdx-classes.ts"
import rehypeClassNames from "rehype-class-names"
// import astroCriticalCss from "./tools/astro-critical-css.js"

// https://astro.build/config

const { SPACE } = loadEnv(
	process.env.NODE_ENV ?? "development",
	process.cwd(),
	"",
)
const isProdSpaceValue = SPACE === "main"
export default defineConfig({
	site: isProdSpaceValue
		? "https://romain-breton.com"
		: "https://preprod.romain-breton.com",
	output: "static",
	security: {
		// csp: true,
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			cssCodeSplit: false,
		},
	},

	build: {
		inlineStylesheets: "never",
		assets: "assets",
	},
	image: {
		responsiveStyles: true,
	},

	markdown: {
		shikiConfig: {
			// Choisir parmi les thèmes intégrés de Shiki (ou ajouter le vôtre)
			// https://shiki.style/themes
			theme: "github-dark-high-contrast",
			wrap: true,
		},
	},

	integrations: [
		// criticalCss({
		// 	// silent: true,
		// 	// htmlPathRegex: "**/test.html",
		// 	height: 865,
		// 	width: 1440,
		// }),
		// astroCriticalCss(),
		sitemap({
			filter: (page) => {
				const excludedPages = ["/design-system"]
				return !excludedPages.includes(page)
			},
			serialize: (page) => {
				if (page.url.startsWith("/parlons-code/")) {
					return {
						url: page.url,
						priority: 0.6,
						lastmod: new Date("").toISOString(),
					}
				}

				if (page.url === "/") {
					return {
						url: page.url,
						priority: 1.0,
						lastmod: new Date().toISOString(),
					}
				}

				return {
					url: page.url,
					priority: 0.8,
					lastmod: new Date().toISOString(),
				}
			},
		}),
		mdx({
			rehypePlugins: [
				[
					rehypeClassNames,
					{
						...mdxClasses,
					},
				],
			],
		}),
	],
})
