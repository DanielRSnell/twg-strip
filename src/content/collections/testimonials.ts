import { defineCollection, z } from "astro:content";

export const testimonialsCollection = defineCollection({
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    homepage_title: z.string(),
    content: z.string(),
    testimonials: z.array(
      z.object({
        name: z.string(),
        designation: z.string(),
        avatar: z.string(),
        content: z.string(),
      })
    ),
  }),
});
