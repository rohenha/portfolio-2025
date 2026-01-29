import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/pages/parlons-code" }),
  schema: z.object({
    title: z.string(),
    // description: z.string(),
    // pubDate: z.coerce.date(),
  }),
});

export const collections = { blog };
