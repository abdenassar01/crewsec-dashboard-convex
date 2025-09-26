import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { betterAuth } from "better-auth";
import { v } from "convex/values";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false },
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },

    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    user: {
      additionalFields: {
        // role: { type: "string", required: false, defaultValue: "CLIENT" },
      },

    },
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },


    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex(),
    ],
  });
};

// Mutation to sync user to Convex users table
export const syncUserToConvex = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user in Convex users table
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name || args.email.split("@")[0],
      role: "CLIENT",
      enabled: true,
      userId: args.userId,
    });

    return userId;
  },
});

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});