"use client";

import { LoginForm } from "./login-form";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <LoginForm className={className} {...props} />;
}
