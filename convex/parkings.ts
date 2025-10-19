import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { type Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { authComponent, createAuth } from './auth';
import { getAuthenticatedUser, requireAdmin } from './auth/helpers';

export const list = query({
  args: { query: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }

    let parkings = [];

    if (!args.query) {
      parkings = await ctx.db.query('parkings').order('desc').collect();
    } else {
      parkings = await ctx.db
        .query('parkings')
        .withSearchIndex('by_name', (q) => q.search('name', args.query || ''))
        .collect();
    }

    const pageWithUsers = await Promise.all(
      parkings.map(async (parking) => {
        const user = await ctx.db.get(parking.userId);
        const imageUrl = parking.imageStorageId
          ? await ctx.storage.getUrl(parking.imageStorageId)
          : null;
        return { ...parking, user, imageUrl };
      }),
    );

    return pageWithUsers;
  },
});

export const getByUserId = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();
  },
});

export const getMyParking = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      throw Error('Unauthenticated');
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', user?._id))
      .unique();

    let imageUrl = '';
    if (parking?.imageStorageId) {
      try {
        imageUrl = (await ctx.storage.getUrl(parking.imageStorageId)) || '';
      } catch (error) {
        console.error('Failed to get avatar URL:', error);
        imageUrl = '';
      }
    }

    return { ...parking, imageUrl, user };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    userId: v.id('users'),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert('parkings', {
      ...args,
      unresolvedFelparkering: 0,
      unresolvedMakuleras: 0,
    });
  },
});

export const getUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteImage = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.storage.delete(args.storageId);
  },
});

export const updateParkingAndUser = mutation({
  args: {
    parkingId: v.id('parkings'),
    // User fields
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
    // Parking fields
    parkingName: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const {
      parkingId,
      email,
      name,
      phone,
      role,
      parkingName,
      description,
      location,
      website,
      address,
      imageStorageId,
    } = args;

    // Get parking to find userId
    const parking = await ctx.db.get(parkingId);
    if (!parking) {
      throw new Error('Parking not found');
    }

    // Update user
    await ctx.db.patch(parking.userId, {
      email,
      name,
      phone,
      role,
    });

    // Update parking
    await ctx.db.patch(parkingId, {
      name: parkingName,
      description,
      location,
      website,
      address,
      imageStorageId,
    });

    return { success: true };
  },
});

export const update = mutation({
  args: {
    id: v.id('parkings'),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    website: v.string(),
    address: v.string(),
    userId: v.id('users'),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const anonymizeParking = mutation({
  args: { id: v.id('parkings') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const parking = await ctx.db.get(args.id);
    if (!parking) {
      throw new Error('Parking not found.');
    }

    const parkingId = args.id;

    // 3. Anonymize all associated vehicles
    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', parkingId))
      .collect();

    for (const vehicle of vehicles) {
      await ctx.db.patch(vehicle._id, {
        // Replace the reference (e.g., license plate) with a generic ID
        reference: `ANON-${vehicle._id.substring(0, 8)}`,
        name: 'Anonymized Vehicle',
      });
    }

    // 4. Delete associated reports/canceled violations
    const reports = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', parkingId))
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
      description: '',
      location: 'N/A',
      website: '',
      address: '',
      imageStorageId: undefined,
      unresolvedMakuleras: 0,
      unresolvedFelparkering: 0,
      // userId is kept for historical/statistical linkage.
    });

    return {
      success: true,
      message:
        'Parking and associated vehicles have been successfully anonymized.',
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
    name: v.string(),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
    // Parking details
    parkingName: v.string(),
    parkingDescription: v.string(),
    parkingLocation: v.string(),
    parkingWebsite: v.string(),
    parkingAddress: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
    });

    if (!session?.user?.id) {
      throw new Error('User creation failed, could not retrieve user ID.');
    }

    let user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', session.user.id))
      .unique();

    let userId = null;

    if (!user) {
      userId = await ctx.db.insert('users', {
        email: args.email,
        name: args.name,
        role: args.role,
        enabled: true,
        userId: session.user.id,
      });
    } else {
      userId = user._id;
    }

    await ctx.db.insert('parkings', {
      name: args.parkingName,
      description: args.parkingDescription,
      location: args.parkingLocation,
      website: args.parkingWebsite,
      address: args.parkingAddress,
      userId,
      imageStorageId: args.imageStorageId,
      unresolvedFelparkering: 0,
      unresolvedMakuleras: 0,
    });

    return {
      success: true,
      message: `User ${args.email} and their parking created.`,
    };
  },
});

export const getAvailabilityByParking = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query('parkingAvailability')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
      .order('desc')
      .collect();
  },
});

export const getAvailabilityByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    parkingId: v.optional(v.id('parkings')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let allAvailability;

    if (args.parkingId) {
      allAvailability = await ctx.db
        .query('parkingAvailability')
        .withIndex('by_parkingId', (q) =>
          q.eq('parkingId', args.parkingId as Id<'parkings'>),
        )
        .order('desc')
        .collect();
    } else {
      allAvailability = await ctx.db
        .query('parkingAvailability')
        .order('desc')
        .collect();
    }

    // Filter for overlapping availability
    return allAvailability.filter((availability) => {
      return (
        availability.startDate <= args.endDate &&
        availability.endDate >= args.startDate
      );
    });
  },
});

// Public queries for regular users
export const getUserParking = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return null;
    }

    // Find the user in our users table
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return null;
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return null;
    }

    // Get image URL if exists
    const imageUrl = parking.imageStorageId
      ? await ctx.storage.getUrl(parking.imageStorageId)
      : null;

    return { ...parking, imageUrl };
  },
});

export const getPublicParkingById = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args) => {
    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_id', (q) => q.eq('_id', args.parkingId))
      .unique();

    if (!parking) {
      return null;
    }

    // Get user info
    const user = await ctx.db
      .query('users')
      .withIndex('by_id', (q) => q.eq('_id', parking.userId))
      .unique();

    // Get image URL if exists
    const imageUrl = parking.imageStorageId
      ? await ctx.storage.getUrl(parking.imageStorageId)
      : null;

    return { ...parking, user, imageUrl };
  },
});

export const getPublicParkings = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const parkings = await ctx.db
      .query('parkings')
      .order('desc')
      .paginate(args.paginationOpts);

    const pageWithDetails = await Promise.all(
      parkings.page.map(async (parking) => {
        const user = await ctx.db.get(parking.userId);
        const imageUrl = parking.imageStorageId
          ? await ctx.storage.getUrl(parking.imageStorageId)
          : null;
        return { ...parking, user, imageUrl };
      }),
    );

    return { ...parkings, page: pageWithDetails };
  },
});

export const createAvailability = mutation({
  args: {
    parkingId: v.id('parkings'),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal('AVAILABLE'),
      v.literal('BOOKED'),
      v.literal('MAINTENANCE'),
    ),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert('parkingAvailability', args);
    return { success: true };
  },
});

export const updateAvailability = mutation({
  args: {
    id: v.id('parkingAvailability'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('AVAILABLE'),
        v.literal('BOOKED'),
        v.literal('MAINTENANCE'),
      ),
    ),
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
  args: { id: v.id('parkingAvailability') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const deleteParking = mutation({
  args: { id: v.id('parkings') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
