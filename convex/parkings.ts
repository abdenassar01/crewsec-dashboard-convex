import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./auth/helpers";
import { createAuth } from "./auth";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const parkings = await ctx.db.query("parkings").order("desc").paginate(args.paginationOpts);

    const pageWithUsers = await Promise.all(
        parkings.page.map(async (parking) => {
            const user = await ctx.db.get(parking.userId);
            return { ...parking, user };
        })
    );

    return { ...parkings, page: pageWithUsers };
  },
});


export const getByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.query("parkings")
            .withIndex("by_userId", q => q.eq("userId", args.userId))
            .unique();
    }
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    userId: v.id("users"),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("parkings", {
        ...args,
        unresolvedFelparkering: 0,
        unresolvedMarkuleras: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("parkings"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    userId: v.id("users"),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const anonymizeParking = mutation({
  args: { id: v.id("parkings") },
  handler: async (ctx, args) => {

    await requireAdmin(ctx);

    const parking = await ctx.db.get(args.id);
    if (!parking) {
      throw new Error("Parking not found.");
    }

    const parkingId = args.id;

    // --- Process Associated Data ---

    // 3. Anonymize all associated vehicles
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_parkingId", (q) => q.eq("parkingId", parkingId))
      .collect();

    for (const vehicle of vehicles) {
      await ctx.db.patch(vehicle._id, {
        // Replace the reference (e.g., license plate) with a generic ID
        reference: `ANON-${vehicle._id.substring(0, 8)}`,
        name: "Anonymized Vehicle",
      });
    }

    // 4. Delete associated reports/canceled violations
    // Reports are often too contextual; deleting is safer than complex anonymization.
    const reports = await ctx.db
      .query("canceledViolations")
      .withIndex("by_parkingId", (q) => q.eq("parkingId", parkingId))
      .collect();

    for (const report of reports) {
      await ctx.db.delete(report._id);
    }

    // 5. Handle File Storage (Delete the identifying image)
    if (parking.imageStorageId) {
      await ctx.storage.delete(parking.imageStorageId);
    }

    // --- Anonymize the Parking Record ---
    await ctx.db.patch(parkingId, {
      name: `[Anonymized Parking ${parkingId.substring(0, 6)}]`,
      description: "",
      location: "N/A",
      website: "",
      address: "",
      imageStorageId: undefined,
      unresolvedMarkuleras: 0,
      unresolvedFelparkering: 0,
      // userId is kept for historical/statistical linkage.
    });

    return {
      success: true,
      message: "Parking and associated vehicles have been successfully anonymized.",
      anonymizedVehiclesCount: vehicles.length,
      deletedReportsCount: reports.length,
    };
  },
});

export const createUserAndParking = mutation({
  args: {
    // User details
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("EMPLOYER"), v.literal("CLIENT")),
    // Parking details
    parkingName: v.string(),
    parkingDescription: v.string(),
    parkingLocation: v.string(),
    parkingWebsite: v.string(),
    parkingAddress: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // 1. Create the user using better-auth's API
    // The `register` method returns the created user session, from which we can get the user ID.
    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: `${args.email.split('@')[0]}`, // Default name from email prefix
        // role: args.role,
      },
    });

    if (!session?.user?.id) {
      throw new Error("User creation failed, could not retrieve user ID.");
    }

    const newUserId = session.user.id as any; // Cast to Id<"users">

    // 2. Create the parking and associate it with the new user
    await ctx.db.insert("parkings", {
      name: args.parkingName,
      description: args.parkingDescription,
      location: args.parkingLocation,
      website: args.parkingWebsite,
      address: args.parkingAddress,
      userId: newUserId,
      unresolvedFelparkering: 0,
      unresolvedMarkuleras: 0,
    });

    return { success: true, message: `User ${args.email} and their parking created.` };
  },
});

export const getAvailabilityByParking = query({
  args: { parkingId: v.id("parkings") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("parkingAvailability")
      .withIndex("by_parkingId", q => q.eq("parkingId", args.parkingId))
      .order("desc")
      .collect();
  },
});

export const getAvailabilityByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    parkingId: v.optional(v.id("parkings"))
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let allAvailability;

    if (args.parkingId) {
      allAvailability = await ctx.db
        .query("parkingAvailability")
        .withIndex("by_parkingId", q => q.eq("parkingId", args.parkingId as Id<"parkings">))
        .order("desc")
        .collect();
    } else {
      allAvailability = await ctx.db
        .query("parkingAvailability")
        .order("desc")
        .collect();
    }

    // Filter for overlapping availability
    return allAvailability.filter(availability => {
      return availability.startDate <= args.endDate && availability.endDate >= args.startDate;
    });
  },
});

export const createAvailability = mutation({
  args: {
    parkingId: v.id("parkings"),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("AVAILABLE"), v.literal("BOOKED"), v.literal("MAINTENANCE")),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("parkingAvailability", args);
    return { success: true };
  },
});

export const updateAvailability = mutation({
  args: {
    id: v.id("parkingAvailability"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("AVAILABLE"), v.literal("BOOKED"), v.literal("MAINTENANCE"))),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
    return { success: true };
  },
});

export const deleteAvailability = mutation({
  args: { id: v.id("parkingAvailability") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});