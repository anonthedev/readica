import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://mktpqsgqflwenwhijsjm.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export async function supabaseClient(supabaseToken: string) {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: "Bearer " + supabaseToken } },
  });
  return supabase;
}
