export function isDevBypassEnabled() {
  return process.env.DEV_BYPASS_AUTH === "true";
}

export function getDevUser() {
  return {
    id: "dev-user",
    email: "dev@local",
  };
}


