import z from "zod";
import resolverJson from "./resolver.json";

// Models this file's actual shape (see resolver.json) rather than the
// open-ended Record<string, ...> that ResolverDocument (utils/resolve.ts)
// uses to stay generic over any resolver document. AutoForm renders fields
// from named object keys, so the dynamic-key generality would just show up
// as an unrenderable blob — this schema trades that generality for concrete
// fields that map onto real form inputs.
const sourceRef = z.object({
  $ref: z.string(),
});

const set = z.object({
  sources: z.array(sourceRef),
});

const sets = z.object({
  foundation: set,
  typography: set,
  strokeStyle: set,
  border: set,
  spacing: set,
  motion: set,
  shadow: set,
  gradient: set,
});

const themeModifier = z.object({
  contexts: z.object({
    light: z.array(sourceRef),
    dark: z.array(sourceRef),
  }),
  // Which context key above is active by default — kept as a plain string,
  // matching ModifierDef in utils/resolve.ts, rather than an enum: JSON
  // imports widen literal string properties to `string`, so a
  // z.enum(["light", "dark"]) default would fight the imported type.
  default: z.string(),
});

const platformModifier = z.object({
  contexts: z.object({
    web: z.array(sourceRef),
    native: z.array(sourceRef),
  }),
  default: z.string(),
});

const brandModifier = z.object({
  description: z.string().optional(),
  contexts: z.object({
    acme: z.array(sourceRef),
    globex: z.array(sourceRef),
  }),
  default: z.string(),
});

const modifiers = z.object({
  theme: themeModifier,
  platform: platformModifier,
  brand: brandModifier,
});

// Each field's `.default(...)` is seeded from the real resolver.json so
// @autoform/zod's ZodProvider.getDefaultValues() renders the form
// pre-filled with the current file contents.
export const resolverSchema = z.object({
  $schema: z.string().optional().default(resolverJson.$schema),
  version: z.string().default(resolverJson.version),
  sets: sets.default(resolverJson.sets),
  modifiers: modifiers.default(resolverJson.modifiers),
  resolutionOrder: z.array(sourceRef).default(resolverJson.resolutionOrder),
});

export type ResolverFormValues = z.infer<typeof resolverSchema>;
