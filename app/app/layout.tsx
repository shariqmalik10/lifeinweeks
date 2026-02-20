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
  const user = data?.claims ?? (isDevBypassEnabled() ? getDevUser() : null);

  if (!user) {
    redirect("/auth/login");
  }

  const userEmail = typeof user.email === "string" ? user.email : undefined;

  return (
    <AppLayoutClient userEmail={userEmail}>
      {children}
    </AppLayoutClient>
  );
}


