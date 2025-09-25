import { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { Doc, Id } from "../_generated/dataModel";

export const requireAdmin = async (ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> => {
  // Debug: Check if we can get any session information
  console.log("[Debug] Checking authentication...");

  try {
    const authUser = await authComponent.getAuthUser(ctx);
    console.log("[Debug (Auth User)]: ", authUser);

    if (!authUser) {
      console.log("[Debug] No auth user found");
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(authUser.userId as Id<"users">);
    console.log("[Debug (User from DB)]: ", user);

    if (!user) {
      console.log("[Debug] User not found in database");
      throw new Error("User not found");
    }

    if (user.role !== "ADMIN") {
      console.log("[Debug] User role is not ADMIN:", user.role);
      throw new Error("Not authorized");
    }

    console.log("[Debug] Authentication successful for user:", user.email);
    return user;
  } catch (error) {
    console.log("[Debug] Authentication error:", error);
    throw error;
  }
}

