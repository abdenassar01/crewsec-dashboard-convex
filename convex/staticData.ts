
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./auth/helpers";

// --- Car Brands ---
export const listCarBrands = query({
  args: { search: v.optional(v.string()), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const query = args.search ? ctx.db.query("carBrands").withSearchIndex("by_label", q => q.search("label", args.search!)) : ctx.db.query("carBrands");
    return query.paginate(args.paginationOpts);
  }
});

export const createCarBrand = mutation({ args: { label: v.string() }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.insert("carBrands", args); } });

export const updateCarBrand = mutation({ args: { id: v.id("carBrands"), label: v.string() }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.patch(args.id, { label: args.label }); } });

export const deleteCarBrand = mutation({ args: { id: v.id("carBrands") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.delete(args.id); } });

// --- Locations ---
export const listLocations = query({
  args: { search: v.optional(v.string()), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const query = args.search ? ctx.db.query("locations").withSearchIndex("by_label", q => q.search("label", args.search!)) : ctx.db.query("locations");
    return query.paginate(args.paginationOpts);
  }
});

export const createLocation = mutation({ args: { label: v.string() }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.insert("locations", args); } });

export const updateLocation = mutation({ args: { id: v.id("locations"), label: v.string() }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.patch(args.id, { label: args.label }); } });

export const deleteLocation = mutation({ args: { id: v.id("locations") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.delete(args.id); } });

// --- Towns ---
export const listTowns = query({
  args: { search: v.optional(v.string()), locationId: v.optional(v.id("locations")), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const query = ctx.db.query("towns");

    if(args.locationId) {
      query.withIndex("by_locationId", q => q.eq("locationId", args.locationId!)).paginate(args.paginationOpts);
    }

    if (args.search) {
      return ctx.db.query("towns")
                   .withSearchIndex("by_label", q => q.search("label", args.search!))
                   .paginate(args.paginationOpts);
    }
    return query.paginate(args.paginationOpts);
  }
});

export const createTown = mutation({ args: { label: v.string(), number: v.number(), locationId: v.id("locations") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.insert("towns", args); } });

export const updateTown = mutation({ args: { id: v.id("towns"), label: v.optional(v.string()), number: v.optional(v.number()) }, handler: async (ctx, {id, ...rest}) => { await requireAdmin(ctx); return ctx.db.patch(id, rest); } });

export const deleteTown = mutation({ args: { id: v.id("towns") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.delete(args.id); } });

// --- Violations ---
export const listViolations = query({
  args: { search: v.optional(v.string()), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const query = args.search ? ctx.db.query("violations").withSearchIndex("by_label", q => q.search("label", args.search!)) : ctx.db.query("violations");
    return query.paginate(args.paginationOpts);
  }
});

export const createViolation = mutation({ args: { label: v.string(), number: v.number() }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.insert("violations", args); } });

export const updateViolation = mutation({ args: { id: v.id("violations"), label: v.optional(v.string()), number: v.optional(v.number()) }, handler: async (ctx, {id, ...rest}) => { await requireAdmin(ctx); return ctx.db.patch(id, rest); } });

export const deleteViolation = mutation({ args: { id: v.id("violations") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.delete(args.id); } });

// --- LocationViolations (Join Table) ---
export const listLocationViolations = query({
  args: { locationId: v.optional(v.id("locations")), violationId: v.optional(v.id("violations")), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const query = args.locationId
      ? ctx.db.query("locationViolations").withIndex("by_locationId", q => q.eq("locationId", args.locationId!))
      : args.violationId
      ? ctx.db.query("locationViolations").withIndex("by_violationId", q => q.eq("violationId", args.violationId!))
      : ctx.db.query("locationViolations");
    return query.paginate(args.paginationOpts);
  }
});

export const createLocationViolation = mutation({ args: { price: v.number(), locationId: v.id("locations"), violationId: v.id("violations") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.insert("locationViolations", args); } });

export const updateLocationViolation = mutation({ args: { id: v.id("locationViolations"), price: v.optional(v.number()) }, handler: async (ctx, {id, ...rest}) => { await requireAdmin(ctx); return ctx.db.patch(id, rest); } });

export const deleteLocationViolation = mutation({ args: { id: v.id("locationViolations") }, handler: async (ctx, args) => { await requireAdmin(ctx); return ctx.db.delete(args.id); } });