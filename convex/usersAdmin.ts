import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./auth/helpers";
import { createAuth } from "./auth";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").order("desc").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.userId);
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

    await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.email.split("@")[0],
        // role: args.role,
      },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("EMPLOYER"), v.literal("CLIENT")),
    enabled: v.boolean(),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { ...rest });
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});