"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-xl border border-border bg-card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex size-14 items-center justify-center rounded-full bg-green-500/10 mb-4"
          >
            <CheckCircle2 className="size-7 text-green-500" />
          </motion.div>

          <h1 className="text-xl font-semibold text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            We&apos;ve sent a confirmation link to your email address.
            Click the link to activate your account.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-3">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder.
            </p>
          </div>

          <div className="mt-6">
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/auth/login">
                <ArrowLeft className="size-4" />
                Back to Sign in
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
