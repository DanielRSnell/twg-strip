import { defineCollection, z } from "astro:content";

const buttonSchema = z.object({
  enable: z.boolean(),
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
      brands: z.array(z.string()).optional(),
    }),

    social_proof: z.object({
      title: z.string(),
      subtitle: z.string(),
      logos: z.array(z.object({
        name: z.string(),
        domain: z.string(),
      })),
      callout: z.string(),
      callout_stats: z.string().optional(),
    }).optional(),

    blueprint: z.object({
      title: z.string(),
      description: z.string(),
      points: z.array(titledPointSchema),
      footer: z.string(),
      button: z.object({
        label: z.string(),
        link: z.string(),
      }),
    }).optional(),

    tracks: z.object({
      title: z.string(),
      track_a: z.object({
        title: z.string(),
        description: z.string(),
        points: z.array(titledPointSchema),
      }),
      track_b: z.object({
        title: z.string(),
        description: z.string(),
        points: z.array(titledPointSchema),
      }),
    }).optional(),

    coop: z.object({
      title: z.string(),
      description: z.string(),
      points: z.array(titledPointSchema),
    }).optional(),

    empower: z.object({
      title: z.string(),
      description: z.string(),
      points: z.array(titledPointSchema),
    }).optional(),

    cta_section: z.object({
      title: z.string(),
      description: z.string(),
      subtitle: z.string(),
      steps: z.array(z.object({
        label: z.string(),
        text: z.string(),
      })),
      button: z.object({
        label: z.string(),
        link: z.string(),
      }),
    }).optional(),

    // Legacy fields (kept optional for backwards compatibility)
    service: z.object({
      title: z.string(),
      services: z.array(
        z.object({
          title: z.string(),
          image: z.string(),
          content: z.string(),
          button: buttonSchema,
        })
      ),
    }).optional(),
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
    }).optional(),
    about: z.object({
      title: z.string(),
      content: z.string(),
      content_2: z.string(),
      image: z.string(),
      button: buttonSchema,
    }).optional(),
  }),
});
