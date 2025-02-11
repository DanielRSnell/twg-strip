import { defineCollection, z } from "astro:content";

export const aboutCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    description: z.string(),
    image: z.string(),
    button: z.object({
      enable: z.boolean(),
      label: z.string(),
      link: z.string(),
    }),
    story: z.object({
      title: z.string(),
      content_1: z.string(),
      content_2: z.string(),
      stats: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
    }),
    value: z.object({
      title: z.string(),
      content: z.string(),
      values: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ),
    }),
    team: z.object({
      title: z.string(),
      content: z.string(),
      members: z.array(
        z.object({
          name: z.string(),
          image: z.string(),
          designation: z.string(),
        })
      ),
    }),
    career: z.object({
      title: z.string(),
      content: z.string(),
    }),
    draft: z.boolean().optional(),
  }),
});
