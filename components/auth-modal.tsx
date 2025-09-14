"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TreeAnimation } from "@/components/tree-animation";
import { createClient } from "@/lib/supabase/client";
import { X, Github, Mail } from "lucide-react";

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) console.error("Error:", error);
    } catch (error) {
      console.error("Supabase not configured:", error);
      alert("Please configure your Supabase environment variables");
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) console.error("Error:", error);
    } catch (error) {
      console.error("Supabase not configured:", error);
      alert("Please configure your Supabase environment variables");
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        Sign In
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-background rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Left side - Auth form */}
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                      {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p className="text-muted-foreground">
                      {isSignUp
                        ? "Join us and start building something amazing"
                        : "Sign in to continue to your account"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleGoogleSignIn}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Continue with Google
                    </Button>

                    <Button
                      onClick={handleGitHubSignIn}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Continue with GitHub
                    </Button>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isSignUp
                        ? "Already have an account?"
                        : "Don't have an account?"}{" "}
                      <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary hover:underline font-medium"
                      >
                        {isSignUp ? "Sign in" : "Sign up"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Tree animation */}
              <div className="flex-1">
                <TreeAnimation />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
