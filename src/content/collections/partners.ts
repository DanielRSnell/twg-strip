import { defineCollection, z } from "astro:content";

export const partnersCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    partners: z.array(
      z.object({
        name: z.string(),
        logo: z.string(),
        description: z.string(),
        partnership_type: z.string(),
        website: z.string(),
        featured: z.boolean().optional(),
      })
    ),
    draft: z.boolean().optional(),
  }),
});
