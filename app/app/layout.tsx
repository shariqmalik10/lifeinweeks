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

  const userEmail = typeof claims.email === "string" ? claims.email : undefined;
  const userId = typeof claims.sub === "string" ? claims.sub : undefined;

  const meta = typeof claims.user_metadata === "object" && claims.user_metadata !== null
    ? (claims.user_metadata as Record<string, unknown>)
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


