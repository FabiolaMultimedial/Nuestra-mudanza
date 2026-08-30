import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Configuralas en .env.local (desarrollo) o en las Environment Variables de Vercel (producción)."
  );
}

export const supabase = createClient(url, anonKey);
