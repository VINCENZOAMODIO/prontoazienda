import { supabase } from "@/lib/supabase";

export async function richiediLogin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return user;
}