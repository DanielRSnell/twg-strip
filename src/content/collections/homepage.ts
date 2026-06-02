import { defineCollection, z } from "astro:content";

const buttonSchema = z.object({
  enable: z.boolean(),
  label: z.string(),
  link: z.string(),
});

const linkSchema = z.object({
  label: z.string(),
  link: z.string(),
});

const titledPointSchema = z.object({
  title: z.string(),
  text: z.string(),
});

export const homeCollection = defineCollection({
  schema: z.object({
    banner: z.object({
      title: z.string(),
      content: z.string(),
      image: z.string().optional(),
      button: buttonSchema,
      button_secondary: buttonSchema.optional(),
    }),

    blueprint: z.object({
      title: z.string(),
      description: z.string(),
      infographic: z.array(z.object({
        current: z.string(),
        solution: z.string(),
        destination: z.string(),
      })),
      button: linkSchema,
    }).optional(),

    amalgamy: z.object({
      title: z.string(),
      intro: z.string(),
      capabilities: z.array(titledPointSchema),
      button: linkSchema,
    }).optional(),

    tracks: z.object({
      title: z.string(),
      audiences: z.array(titledPointSchema).optional(),
      track_a: z.object({
        title: z.string(),
        description: z.string(),
      }),
      track_b: z.object({
        title: z.string(),
        description: z.string(),
      }),
      button: linkSchema.optional(),
    }).optional(),

    empower: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      button: linkSchema.optional(),
    }).optional(),

    coop: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      points: z.array(titledPointSchema),
      button: linkSchema.optional(),
    }).optional(),

    social_proof: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      case_study: z.object({
        description: z.string(),
        quote: z.string(),
        attribution: z.string(),
      }).optional(),
    }).optional(),

    cta_section: z.object({
      title: z.string(),
      description: z.string(),
      subtitle: z.string().optional(),
      button: linkSchema,
    }).optional(),
  }),
});
