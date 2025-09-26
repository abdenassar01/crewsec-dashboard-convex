import { api } from "@convex/_generated/api";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";

export const requireAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const authUser = await authComponent.getAuthUser(ctx);
  console.log("[Debug (Auth User)]: ", authUser);

  if (!authUser) {
      throw new Error("Not authenticated");
  }

  if (!authUser._id) {
      throw new Error("User is disabled");
  }

  const user = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", authUser?.email!))
      .unique();
  console.log("[Debug (User)]: ", user);

  // Check if user has ADMIN role in Better Auth
  // The role might be in additionalFields or as a direct property
  if (user?.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  return authUser;
}