import { z, defineCollection } from "astro:content";

const buttonSchema = z.object({
  label: z.string(),
  link: z.string(),
});

export const productsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),

    hero: z.object({
      badge: z.string(),
      title: z.string(),
      tagline: z.string(),
      button_primary: buttonSchema,
      button_secondary: buttonSchema,
    }),

    bottleneck: z.object({
      title: z.string(),
      intro: z.string(),
      pain_points: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })),
      callout: z.object({
        title: z.string(),
        text: z.string(),
      }),
      closer: z.string(),
    }),

    capabilities: z.object({
      title: z.string(),
      intro: z.string(),
      columns: z.array(z.object({
        title: z.string(),
        benefits: z.array(z.object({
          bold: z.string(),
          text: z.string(),
        })),
      })),
    }),

    federated: z.object({
      title: z.string(),
      intro: z.string(),
      deployment_models: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })),
      handshake: z.object({
        intro: z.string(),
        items: z.array(z.object({
          label: z.string(),
          text: z.string(),
        })),
      }),
    }),

    roadmap: z.object({
      title: z.string(),
      intro: z.string(),
      items: z.array(z.object({
        number: z.number(),
        title: z.string(),
        description: z.string(),
        sub_points: z.array(z.object({
          bold: z.string(),
          text: z.string(),
        })).optional(),
        sub_heading: z.string().optional(),
      })),
    }),

    cta: z.object({
      title: z.string(),
      description: z.string(),
      button_primary: buttonSchema,
      button_secondary: buttonSchema,
    }),
  }),
});
