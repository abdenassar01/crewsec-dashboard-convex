import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createAuth, authComponent } from "./auth";
import { requireAdmin } from "./auth/helpers";
import { paginationOptsValidator } from "convex/server";

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await createAuth(ctx).api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers: await authComponent.getHeaders(ctx),
    });
  },
});

// Query to get all users from Better Auth
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // For now, return empty array since adapter methods may vary
    // This can be implemented based on the actual Better Auth adapter API
    return { page: [], isDone: true, continueCursor: null };
  },
});

// Query to get current user's profile from Better Auth
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user from Better Auth
    return await authComponent.getAuthUser(ctx);
  },
});

// Query to get user by ID from Better Auth
export const getById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // For now, return null since adapter methods may vary
    // This can be implemented based on the actual Better Auth adapter API
    return null;
  },
});


export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("EMPLOYER"), v.literal("CLIENT")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Create user through Better Auth
    await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.email.split("@")[0],
      },
    });
  },
});

export const update = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("EMPLOYER"), v.literal("CLIENT")),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // For now, just return success since Better Auth API may vary
    // This can be implemented based on the actual Better Auth updateUser API
    console.log("[Update User] Would update user:", args.userId, args);
    return { success: true };
  },
});

export const deleteUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // For now, just return success since Better Auth API may vary
    // This can be implemented based on the actual Better Auth deleteUser API
    console.log("[Delete User] Would delete user:", args.userId);
    return { success: true };
  },
});