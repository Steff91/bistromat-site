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
    occasions: z.array(z.string()).default([]),
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
    showInquiry: z.boolean().default(true),
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
