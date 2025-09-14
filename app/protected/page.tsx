import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-2xl">Your user details</h2>
        <pre className="text-xs font-mono p-4 rounded border bg-muted max-h-32 overflow-auto">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-2xl">Welcome to your dashboard!</h2>
        <p className="text-muted-foreground">
          You&apos;re successfully authenticated. This is where you can build
          your application features.
        </p>
      </div>
    </div>
  );
}
