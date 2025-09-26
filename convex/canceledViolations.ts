import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth/helpers";

const causeType = v.union(v.literal("FELPARKERING"), v.literal("MAKULERA"));

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("canceledViolations").order("desc").collect();
  },
});

export const listForCause = query({
  args: { cause: causeType },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("canceledViolations")
      .withIndex("by_cause", q => q.eq("cause", args.cause))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    reference: v.string(),
    cause: causeType,
    resolved: v.boolean(),
    parkingId: v.id("parkings"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("canceledViolations", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("canceledViolations"),
    reference: v.optional(v.string()),
    cause: v.optional(causeType),
    resolved: v.optional(v.boolean()),
    parkingId: v.optional(v.id("parkings")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("canceledViolations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.delete(args.id);
  },
});