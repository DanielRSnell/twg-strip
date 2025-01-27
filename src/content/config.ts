import { defineCollection, z } from "astro:content";

const aboutCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    description: z.string(),
    image: z.string(),
    button: z.object({
      enable: z.boolean(),
      label: z.string(),
      link: z.string(),
    }),
    story: z.object({
      title: z.string(),
      content_1: z.string(),
      content_2: z.string(),
      stats: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
    }),
    value: z.object({
      title: z.string(),
      content: z.string(),
      values: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ),
    }),
    team: z.object({
      title: z.string(),
      content: z.string(),
      members: z.array(
        z.object({
          name: z.string(),
          image: z.string(),
          designation: z.string(),
        })
      ),
    }),
    career: z.object({
      title: z.string(),
      content: z.string(),
    }),
    draft: z.boolean().optional(),
  }),
});

const careerCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    description: z.string(),
    location: z.string().optional(),
    duration: z.string().optional(),
    vacant: z.string().optional(),
    salary: z.string().optional(),
    content: z.string().optional(),
    button: z
      .object({
        enable: z.boolean(),
        link: z.string(),
        label: z.string(),
      })
      .optional(),
    about: z
      .object({
        image: z.string(),
        stats: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ),
      })
      .optional(),
    why: z
      .object({
        title: z.string(),
        content: z.string(),
        points: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
          })
        ),
      })
      .optional(),
    career: z
      .object({
        title: z.string(),
        content: z.string(),
      })
      .optional(),
    draft: z.boolean().optional(),
  }),
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string(),
    header_title: z.string().optional(),
    description: z.string(),
    homepage_title: z.string().optional(),
    homepage_description: z.string().optional(),
    date: z.string().or(z.date()).optional(),
    cover_image: z.string().optional(),
    image: z.string().optional(),
    author: z.string().optional(),
    author_image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const contactCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    draft: z.boolean(),
  }),
});

const homeCollection = defineCollection({
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

const faqCollection = defineCollection({
  schema: z.object({
    header: z.object({
      title: z.string(),
      content: z.string(),
    }),
    title: z.string(),
    content: z.string(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

const testimonialsCollection = defineCollection({
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    homepage_title: z.string(),
    content: z.string(),
    testimonials: z.array(
      z.object({
        name: z.string(),
        designation: z.string(),
        avatar: z.string(),
        content: z.string(),
      })
    ),
  }),
});

const serviceCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    banner_title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    button: z.object({
      enable: z.boolean(),
      label: z.string(),
      link: z.string(),
    }),
    contact_1: z.string(),
    contact_2: z.string(),
    image: z.string(),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    button: z
      .object({
        enable: z.boolean(),
        label: z.string(),
        link: z.string(),
      })
      .optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  about: aboutCollection,
  career: careerCollection,
  blog: blogCollection,
  contact: contactCollection,
  homepage: homeCollection,
  faq: faqCollection,
  testimonials: testimonialsCollection,
  services: serviceCollection,
  pages: pagesCollection,
};
