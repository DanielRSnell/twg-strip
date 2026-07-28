import { defineCollection, z } from "astro:content";

const buttonSchema = z.object({
  label: z.string(),
  link: z.string(),
});

export const partnersCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    hero: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        content: z.string(),
        button_primary: buttonSchema,
        button_secondary: buttonSchema.optional(),
      })
      .optional(),
    logo_strip: z
      .object({
        title: z.string(),
      })
      .optional(),
    types: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          })
        ),
      })
      .optional(),
    grid: z
      .object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
      })
      .optional(),
    cta: z
      .object({
        title: z.string(),
        description: z.string(),
        button: buttonSchema,
      })
      .optional(),
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
