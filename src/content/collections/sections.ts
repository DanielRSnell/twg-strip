import { defineCollection, z } from "astro:content";
import test from "node:test";

export const sectionsCollection = defineCollection({
  schema: z.object({
    enable: z.boolean().optional(),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    button: z
      .object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      })
      .optional(),
    header: z
      .object({
        title: z.string(),
        content: z.string(),
      })
      .optional(),
    content: z.string().optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
      testimonials: z.array(
      z.object({
        name: z.string(),
        designation: z.string(),
        avatar: z.string(),
        content: z.string(),
      })).optional(),
  }),
});
