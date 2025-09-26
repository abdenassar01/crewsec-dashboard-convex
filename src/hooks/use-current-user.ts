import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

/**
 * Custom hook to get the current user from Convex users table
 */
export function useCurrentUser(): Doc<"users"> | null | undefined {
  return useQuery(api.users.getCurrentUserProfile);
}

/**
 * Hook that ensures user is available
 */
export function useEnsureCurrentUser(): Doc<"users"> {
  const user = useCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}