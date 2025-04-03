import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mktpqsgqflwenwhijsjm.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
// console.log(supabaseKey)
export const supabaseClient = (token: string) =>
  createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
