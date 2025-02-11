import { defineCollection, z } from "astro:content";

export const faqCollection = defineCollection({
  schema: z.object({
    header: z.object({
      title: z.string(),
      content: z.string(),
    }),
    title: z.string(),
    content: z.string(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});
