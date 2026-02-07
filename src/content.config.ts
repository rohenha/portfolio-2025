import { defineCollection } from "astro:content"
import { glob, file } from "astro/loaders"
import { z } from "astro/zod"

const blog = defineCollection({
	loader: glob({ pattern: "*.{md,mdx}", base: "./src/pages/parlons-code" }),
	schema: z.object({
		title: z.string(),
		tags: z.array(z.string()),
		date: z.coerce.date(),
		// description: z.string(),
		// pubDate: z.coerce.date(),
	}),
})

const repos = defineCollection({
	loader: file("./content/repos.json", {
		parser: (text) => JSON.parse(text).list,
	}),
	schema: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		url: z.string().url(),
		tags: z.array(z.string()),
	}),
})

export const collections = { blog, repos }

// {
// 	loader: file("content/repos.json", { parser: (text) => JSON.parse(text).dogs }),
// 	schema:
// }
