import { defineCollection, z } from "astro:content";

export const careerCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    description: z.string(),
    location: z.string().optional(),
    duration: z.string().optional(),
    vacant: z.string().optional(),
    salary: z.string().optional(),
    content: z.string().optional(),
    button: z
      .object({
        enable: z.boolean(),
        link: z.string(),
        label: z.string(),
      })
      .optional(),
    about: z
      .object({
        image: z.string(),
        stats: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ),
      })
      .optional(),
    why: z
      .object({
        title: z.string(),
        content: z.string(),
        points: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
          })
        ),
      })
      .optional(),
    career: z
      .object({
        title: z.string(),
        content: z.string(),
      })
      .optional(),
    draft: z.boolean().optional(),
  }),
});
