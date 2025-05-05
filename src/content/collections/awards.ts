import { defineCollection, z } from "astro:content";

export const awardsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    description: z.string(),
    date: z.date(),
    image: z.string(),
    categories: z.array(z.string()),
    organization: z.string(),
    organization_logo: z.string(),
    type: z.literal("award"),
    draft: z.boolean().optional(),
    award_url: z.string().optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    header_title: z.string().optional(),
    homepage_title: z.string().optional(),
    homepage_description: z.string().optional(),
    cover_image: z.string().optional(),
  }),
});
