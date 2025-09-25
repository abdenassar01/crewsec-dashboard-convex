import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
  baseURL: process.env.SITE_URL || 'http://localhost:3000',
  fetchOptions: {
    credentials: "include",
  },
});