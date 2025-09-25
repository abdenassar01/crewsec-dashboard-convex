import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./auth/helpers";

/**
 * Search for vehicles by reference, optionally filtered by parkingId.
 */
export const search = query({
  args: {
    query: v.string(),
    parkingId: v.optional(v.id("parkings")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.query === "") {
        if(args.parkingId) {
            return ctx.db.query("vehicles")
                .withIndex("by_parkingId", q => q.eq("parkingId", args.parkingId!))
                .paginate(args.paginationOpts);
        }
        return ctx.db.query("vehicles").paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("vehicles")
      .withSearchIndex("by_reference", (q) => q.search("reference", args.query).eq("parkingId", args.parkingId!))
      .paginate(args.paginationOpts);
  },
});


/**
 * Get vehicle details by ID.
 */
export const getById = query({
    args: { id: v.id("vehicles") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.get(args.id);
    }
});

/**
 * Create a new vehicle record.
 */
export const create = mutation({
  args: {
    reference: v.string(),
    name: v.string(),
    leaveDate: v.number(),
    joinDate: v.number(),
    parkingId: v.id("parkings"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("vehicles", args);
  },
});

/**
 * Update an existing vehicle's details.
 */
export const update = mutation({
  args: {
    id: v.id("vehicles"),
    reference: v.optional(v.string()),
    name: v.optional(v.string()),
    leaveDate: v.optional(v.number()),
    joinDate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

/**
 * Delete a vehicle record.
 */
export const deleteVehicle = mutation({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});