import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://studio.propgo.my")
    .trim()
    .replace(/\/+$/, "");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_failed`);
  }

  return NextResponse.redirect(data.url);
}
