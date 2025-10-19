import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getAuthenticatedUser, requireAdmin } from './auth/helpers';

// Query to get all vehicles
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const vehicles = await ctx.db.query('vehicles').order('desc').collect();

    const pageWithParking = await Promise.all(
      vehicles.map(async (vehicle) => {
        const parking = await ctx.db.get(vehicle.parkingId);
        return { ...vehicle, parking: parking || undefined };
      }),
    );

    return { ...vehicles, page: pageWithParking };
  },
});

/**
 * Search for vehicles by reference, optionally filtered by parkingId.
 */
export const search = query({
  args: {
    query: v.string(),
    parkingId: v.optional(v.id('parkings')),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);
    if (args.query === '') {
      if (args.parkingId) {
        return ctx.db
          .query('vehicles')
          .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId!))
          .collect();
      }
      return ctx.db.query('vehicles').collect();
    }

    return await ctx.db
      .query('vehicles')
      .withSearchIndex('by_reference_search', (q) =>
        q.search('reference', args.query).eq('parkingId', args.parkingId!),
      )
      .collect();
  },
});

/**
 * Get vehicle details by ID.
 */
export const getById = query({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
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
    parkingId: v.id('parkings'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert('vehicles', args);
  },
});

/**
 * Update an existing vehicle's details.
 */
export const update = mutation({
  args: {
    id: v.id('vehicles'),
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
  args: { id: v.id('vehicles') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// Public queries for regular users
export const getMyVehicles = query({
  args: {
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      throw new Error('This account is not associated to a parking');
    }

    // Get vehicles for this parking
    if (args.query) {
      // Use search index if query is provided
      return await ctx.db
        .query('vehicles')
        .withSearchIndex('by_reference_search', (q) =>
          q.search('reference', args.query!).eq('parkingId', parking._id),
        )
        .collect();
    } else {
      // Use regular index if no query
      return await ctx.db
        .query('vehicles')
        .withIndex('by_parkingId', (q) => q.eq('parkingId', parking._id))
        .order('desc')
        .collect();
    }
  },
});

export const getMyVehicleById = query({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return null;
    }

    const vehicle = await ctx.db.get(args.id);

    // Ensure the vehicle belongs to the user's parking
    if (!vehicle || vehicle.parkingId !== parking._id) {
      return null;
    }

    return vehicle;
  },
});

export const createMyVehicle = mutation({
  args: {
    reference: v.string(),
    name: v.string(),
    leaveDate: v.number(),
    joinDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      throw new Error('Parking not found for this user');
    }

    return await ctx.db.insert('vehicles', {
      ...args,
      parkingId: parking._id,
    });
  },
});

export const updateMyVehicle = mutation({
  args: {
    id: v.id('vehicles'),
    reference: v.optional(v.string()),
    name: v.optional(v.string()),
    leaveDate: v.optional(v.number()),
    joinDate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      throw new Error('Parking not found for this user');
    }

    const vehicle = await ctx.db.get(id);

    // Ensure the vehicle belongs to the user's parking
    if (!vehicle || vehicle.parkingId !== parking._id) {
      throw new Error('Vehicle not found or access denied');
    }

    await ctx.db.patch(id, rest);
  },
});

export const deleteMyVehicle = mutation({
  args: { id: v.id('vehicles') },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Find user's parking
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      throw new Error('Parking not found for this user');
    }

    const vehicle = await ctx.db.get(args.id);

    // Ensure the vehicle belongs to the user's parking
    if (!vehicle || vehicle.parkingId !== parking._id) {
      throw new Error('Vehicle not found or access denied');
    }

    await ctx.db.delete(args.id);
  },
});
