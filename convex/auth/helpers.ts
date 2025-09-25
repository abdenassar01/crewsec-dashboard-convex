import { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";

export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const authUser = await authComponent.getAuthUser(ctx);
  console.log("[Debug (Auth User)]: ", authUser);

  if (!authUser) {
      throw new Error("Not authenticated");
  }

  // Check if user has ADMIN role in Better Auth
  // The role might be in additionalFields or as a direct property
  const userRole = (authUser as any).role || (authUser as any).additionalFields?.role;
  if (userRole !== "ADMIN") {
      throw new Error("Not authorized");
  }

  return authUser;
}