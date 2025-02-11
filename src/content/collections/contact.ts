import { defineCollection, z } from "astro:content";

export const contactCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    draft: z.boolean(),
    contact_info: z.object({
      title: z.string(),
      description: z.string(),
      offices: z.array(
        z.object({
          title: z.string(),
          address: z.string(),
          email: z.string(),
          phone: z.string(),
        })
      ),
      form: z.object({
        title: z.string(),
        description: z.string(),
        options: z.array(z.string()),
      }),
      support: z.object({
        title: z.string(),
        description: z.string(),
        email: z.string(),
        phone: z.string(),
      }),
      sales: z.object({
        title: z.string(),
        description: z.string(),
        email: z.string(),
        phone: z.string(),
      }),
      demo: z.object({
        title: z.string(),
        description: z.string(),
        button: z.object({
          text: z.string(),
          link: z.string(),
        }),
      }),
    }),
  }),
});
