import { createClient } from "@/lib/supabase/server";
import { DayClient } from "./DayClient";
import { getDevUser, isDevBypassEnabled } from "@/lib/auth/dev";

export default async function DayZoomPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;

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

  return <DayClient userKey={userKey} dayParam={day} />;
}


