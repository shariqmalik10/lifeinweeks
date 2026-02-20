import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDevUser, isDevBypassEnabled } from "@/lib/auth/dev";
import { AppLayoutClient } from "./app-layout-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? (isDevBypassEnabled() ? getDevUser() : null);

  if (!claims) {
    redirect("/auth/login");
  }

  const c = claims as Record<string, unknown>;
  const userEmail = typeof c.email === "string" ? c.email : undefined;
  const userId = typeof c.sub === "string" ? c.sub : typeof c.id === "string" ? c.id : undefined;

  const meta = typeof c.user_metadata === "object" && c.user_metadata !== null
    ? (c.user_metadata as Record<string, unknown>)
    : undefined;

  const userMeta = meta
    ? {
        fullName: typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : undefined,
        avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : undefined,
      }
    : undefined;

  return (
    <AppLayoutClient userEmail={userEmail} userId={userId} userMeta={userMeta}>
      {children}
    </AppLayoutClient>
  );
}


