import { defineCollection, z } from "astro:content";

export const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    description: z.string(),
    date: z.date(),
    image: z.string(),
    categories: z.array(z.string()),
    author: z.string(),
    author_image: z.string(),
    type: z.enum(["post", "video", "audio", "press"]),
    draft: z.boolean().optional(),
    video_url: z.string().optional(),
    audio_url: z.string().optional(),
    duration: z.string().optional(),
    transcript: z.string().optional(),
    press_source: z.string().optional(),
    press_url: z.string().optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    header_title: z.string().optional(),
    homepage_title: z.string().optional(),
    homepage_description: z.string().optional(),
    cover_image: z.string().optional(),
  }),
});
