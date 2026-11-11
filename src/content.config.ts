import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per case study in src/content/projects/.
// New files start as drafts and only appear once `draft: false` is set.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    summary: z.string(),
    tech: z.array(z.string()).default([]),
    year: z.number().int().optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { projects };
