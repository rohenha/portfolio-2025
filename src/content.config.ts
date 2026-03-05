import { defineCollection } from "astro:content"
import { glob, file } from "astro/loaders"
import { z } from "astro/zod"

const blog = defineCollection({
	loader: glob({ pattern: "*.{md,mdx}", base: "./content/blog" }),
	schema: z.object({
		title: z.string(),
		draft: z.boolean(),
		tags: z.array(z.string()),
		date: z.coerce.date(),
		relative: z.string().optional(),
	}),
})

const text = defineCollection({
	loader: glob({ pattern: "*.{md,mdx}", base: "./content/text" }),
	schema: z.object({
		title: z.string(),
		draft: z.boolean(),
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

const projects = defineCollection({
	loader: file("./content/projects.json", {
		parser: (text) => JSON.parse(text).list,
	}),
	schema: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		url: z.string().url(),
		tags: z.array(z.string()),
		role: z.string(),
		credits: z.array(z.string()),
		year: z.number(),
	}),
})

export const collections = { blog, repos, text, projects }

// {
// 	loader: file("content/repos.json", { parser: (text) => JSON.parse(text).dogs }),
// 	schema:
// }
