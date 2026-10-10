import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    excerpt: z.string(),
    heroTitle: z.string(),
    heroTitleEm: z.string().optional(),
    intro: z.string(),
    image: z.string().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    occasions: z.array(z.string()).default([]),
    includedTitle: z.string().default('Sve je spremno pre nego što stignete'),
    included: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    gallery: z.array(z.object({ src: z.string().optional(), alt: z.string() })).default([]),
    packagesTitle: z.string().default('Izaberite format'),
    packages: z
      .array(
        z.object({
          label: z.string(),
          name: z.string(),
          features: z.array(z.string()),
          price: z.string(),
          featured: z.boolean().default(false),
        }),
      )
      .default([]),
    steps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    form: z.enum(['event', 'catering', 'workshop', 'voucher', 'none']).default('event'),
  }),
});

const events = defineCollection({
  loader: file('src/content/events.json'),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string(),
    description: z.string(),
    image: z.string().optional(),
  }),
});

const reviews = defineCollection({
  loader: file('src/content/reviews.json'),
  schema: z.object({
    name: z.string(),
    text: z.string(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

export const collections = { services, events, reviews };
