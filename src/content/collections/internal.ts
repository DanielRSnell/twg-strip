import { defineCollection, z } from "astro:content";

export const internalCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    status: z.string().optional(),
    last_updated: z.string().optional(),
    priority: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});
