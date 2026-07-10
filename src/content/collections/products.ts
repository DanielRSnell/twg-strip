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
      eyebrow: z.string(),
      title: z.string(),
      content: z.string(),
      button_primary: buttonSchema,
      button_secondary: buttonSchema,
    }),

    challenges: z.object({
      title: z.string(),
      intro: z.string(),
      pain_points: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })),
    }),

    operational: z.object({
      title: z.string(),
      intro: z.string(),
      whitepaper: z.object({
        title: z.string(),
        teaser: z.string(),
        button: buttonSchema,
      }),
    }),

    capabilities: z.object({
      title: z.string(),
      items: z.array(z.object({
        title: z.string(),
        lead: z.string(),
        more: z.array(z.string()),
      })),
      highlight: z.object({
        title: z.string(),
        paragraphs: z.array(z.string()),
      }).optional(),
    }),

    workloads: z.object({
      title: z.string(),
      intro: z.string(),
      use_cases: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })),
    }),

    personas: z.object({
      title: z.string(),
      items: z.array(z.object({
        title: z.string(),
        outcome: z.string(),
        how: z.string(),
      })),
    }),

    federated: z.object({
      title: z.string(),
      intro: z.string(),
      models_label: z.string(),
      deployment_models: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })),
    }),

    economics: z.object({
      title: z.string(),
      groups: z.array(z.object({
        title: z.string(),
        bullets: z.array(z.object({
          bold: z.string(),
          text: z.string(),
        })),
      })),
    }),

    cta: z.object({
      title: z.string(),
      description: z.string(),
      closer: z.string().optional(),
      button_primary: buttonSchema,
      button_secondary: buttonSchema,
    }),
  }),
});
