import { defineCollection, z } from "astro:content";

export const homeCollection = defineCollection({
  schema: z.object({
    banner: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string(),
      button: z.object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      }),
      brands: z.array(z.string()),
    }),
    service: z.object({
      title: z.string(),
      services: z.array(
        z.object({
          title: z.string(),
          image: z.string(),
          content: z.string(),
          button: z.object({
            enable: z.boolean(),
            label: z.string(),
            link: z.string(),
          }),
        })
      ),
    }),
    feature: z.object({
      title: z.string(),
      content: z.string(),
      features: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          card_content: z.string(),
          icon: z.string(),
          image: z.string(),
        })
      ),
    }),
    about: z.object({
      title: z.string(),
      content: z.string(),
      content_2: z.string(),
      image: z.string(),
      button: z.object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      }),
    }),
  }),
});
