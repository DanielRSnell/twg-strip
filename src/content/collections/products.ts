import { z, defineCollection } from "astro:content";

export const productsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    contact_1: z.string().optional(),
    contact_2: z.string().optional(),
    image: z.string().optional(),
    button: z.object({
      enable: z.boolean(),
      label: z.string().optional(),
      link: z.string().optional(),
    }).optional(),
    banner_title: z.string().optional(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
  }),
});
