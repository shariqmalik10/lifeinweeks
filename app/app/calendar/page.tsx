import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./CalendarClient";
import { getDevUser, isDevBypassEnabled } from "@/lib/auth/dev";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const devUser = isDevBypassEnabled() ? getDevUser() : null;
  const userKey =
    claims?.sub ??
    claims?.email ??
    devUser?.id ??
    devUser?.email ??
    "unknown";

  return <CalendarClient userKey={userKey} />;
}


