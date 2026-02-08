// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"

// import criticalCss from "astro-critical-css"

import mdx from "@astrojs/mdx"
import mdxClasses from "./config/mdx-classes.ts"
import rehypeClassNames from "rehype-class-names"

// https://astro.build/config
export default defineConfig({
	site: "https://romain-breton.com",
	output: "static",
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
		//   // silent: true,
		//   // htmlPathRegex: "**/test.html",
		//   height: 1080,
		//   width: 1920,
		// }),
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
