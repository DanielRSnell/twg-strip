import { defineCollection, z } from "astro:content";

export const pagesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    button: z
      .object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      })
      .optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});
