import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCallback, useState } from "react";

/**
 * Custom hook to get the current user from Better Auth
 * This directly queries the Better Auth user table
 */
export function useCurrentUser() {
  return useQuery(api.users.getCurrentUserProfile);
}

/**
 * Hook that ensures user is available
 * Since we're using Better Auth directly, we just need to check authentication
 */
export function useEnsureCurrentUser() {
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const [isChecking, setIsChecking] = useState(false);

  const ensureUser = useCallback(async () => {
    setIsChecking(true);
    // Since we're using Better Auth directly, the user should be available
    // through the query. If it's null, the user is not authenticated.
    setIsChecking(false);
    return userProfile;
  }, [userProfile]);

  return { userProfile, ensureUser, isSyncing: isChecking };
}