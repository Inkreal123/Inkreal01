import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_MAPBOX_TOKEN: z.string().optional().default(""),
});

function parseEnv() {
  const raw = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
  };
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Environment variable validation failed.");
  }
  return result.data;
}

export const env = parseEnv();
