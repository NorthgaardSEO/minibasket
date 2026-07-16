import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ovelser = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ovelser' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    aldersgruppe: z.array(z.enum(['U6', 'U8', 'U10', 'U12'])).nonempty(),
    kategori: z.enum(['drible', 'skud', 'pasning', 'forsvar', 'leg', 'opvarmning']),
    spillere: z.string(),
    varighed: z.number().int().positive(),
    rekvisitter: z.array(z.string()),
    trin: z.array(z.string()).nonempty(),
    publiceret: z.coerce.date(),
    opdateret: z.coerce.date().optional(), // → dateModified + synlig "Opdateret"-dato
    laerer: z.string().max(120).optional(), // "Hvad børnene lærer" — én citerbar sætning
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    publiceret: z.coerce.date(),
    opdateret: z.coerce.date().optional(), // → dateModified + synlig "Opdateret"-dato
    laesetid: z.number().int().positive().optional(), // minutter, vises ved titlen
  }),
});

export const collections = { ovelser, guides };
