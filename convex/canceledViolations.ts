import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { authComponent } from './auth';
import { getAuthenticatedUser, requireAdmin } from './auth/helpers';

const causeType = v.union(v.literal('FELPARKERING'), v.literal('MAKULERA'));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    return await ctx.db.query('canceledViolations').order('desc').collect();
  },
});

export const listForCause = query({
  args: { cause: causeType },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }

    return await ctx.db
      .query('canceledViolations')
      .withIndex('by_cause', (q) => q.eq('cause', args.cause))
      .collect();
  },
});

export const create = mutation({
  args: {
    reference: v.string(),
    cause: causeType,
    resolved: v.boolean(),
    parkingId: v.id('parkings'),
  },
  handler: async (ctx, args) => {
    const authUser = await getAuthenticatedUser(ctx);

    const parking = await ctx.db.get(args.parkingId);

    if (!(authUser?.role === 'ADMIN' || parking?.userId === authUser?._id)) {
      throw new Error('Not Authorized');
    }
    // Insert the violation with timestamp
    const violationId = await ctx.db.insert('canceledViolations', {
      ...args,
      createdAt: Date.now(),
    });

    // Update parking count if not resolved
    if (!args.resolved) {
      const parking = await ctx.db.get(args.parkingId);
      if (parking) {
        if (args.cause === 'FELPARKERING') {
          await ctx.db.patch(args.parkingId, {
            unresolvedFelparkering: (parking.unresolvedFelparkering || 0) + 1,
          });
        } else if (args.cause === 'MAKULERA') {
          await ctx.db.patch(args.parkingId, {
            unresolvedMakuleras: (parking.unresolvedMakuleras || 0) + 1,
          });
        }
      }
    }

    return violationId;
  },
});

export const update = mutation({
  args: {
    id: v.id('canceledViolations'),
    reference: v.optional(v.string()),
    cause: v.optional(causeType),
    resolved: v.optional(v.boolean()),
    parkingId: v.optional(v.id('parkings')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id('canceledViolations') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id('canceledViolations') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getByParkingId = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    return await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
      .collect();
  },
});

export const getByParkingIdAndCause = query({
  args: {
    parkingId: v.id('parkings'),
    cause: causeType,
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    return await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_cause', (q) =>
        q.eq('parkingId', args.parkingId).eq('cause', args.cause),
      )
      .collect();
  },
});

export const getByMyParkingIdAndCause = query({
  args: {
    cause: causeType,
  },
  handler: async (ctx, args) => {
    const authUser = await getAuthenticatedUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }

    if (authUser.role !== 'CLIENT')
      throw new Error('Not allowed to call this.');

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', authUser._id))
      .unique();

    if (!parking)
      throw new Error('You have no parking associated with this user.');

    return await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_cause', (q) =>
        q.eq('parkingId', parking?._id).eq('cause', args.cause),
      )
      .collect();
  },
});

export const getUnresolvedByParkingId = query({
  args: { parkingId: v.id('parkings') },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    return await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_resolved', (q) =>
        q.eq('parkingId', args.parkingId).eq('resolved', false),
      )
      .collect();
  },
});

export const getUnresolvedByParkingIdAndCause = query({
  args: {
    parkingId: v.id('parkings'),
    cause: causeType,
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    return await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId_and_cause', (q) =>
        q.eq('parkingId', args.parkingId).eq('cause', args.cause),
      )
      .filter((q) => q.eq(q.field('resolved'), false))
      .collect();
  },
});

export const getUnresolvedCount = query({
  args: { cause: causeType },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    const count = await ctx.db
      .query('canceledViolations')
      .withIndex('by_cause', (q) => q.eq('cause', args.cause))
      .collect();
    return count.filter((item) => item.resolved !== true).length;
  },
});

export const resolveViolation = mutation({
  args: {
    id: v.id('canceledViolations'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get the current user from Convex users table
    const currentUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', user.subject))
      .unique();

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Get the violation to check if it was previously unresolved
    const violation = await ctx.db.get(args.id);
    if (!violation) {
      throw new Error('Violation not found');
    }

    // Update the violation
    await ctx.db.patch(args.id, {
      resolved: true,
      notes: args.notes,
    });

    // Update parking count if it was previously unresolved
    if (!violation.resolved) {
      const parking = await ctx.db.get(violation.parkingId);
      if (parking) {
        if (violation.cause === 'FELPARKERING') {
          await ctx.db.patch(violation.parkingId, {
            unresolvedFelparkering: Math.max(
              0,
              (parking.unresolvedFelparkering || 0) - 1,
            ),
          });
        } else if (violation.cause === 'MAKULERA') {
          await ctx.db.patch(violation.parkingId, {
            unresolvedMakuleras: Math.max(
              0,
              (parking.unresolvedMakuleras || 0) - 1,
            ),
          });
        }
      }
    }

    return { success: true };
  },
});

export const unresolvedByCause = query({
  args: { cause: causeType },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      throw new Error('Not authenticated');
    }
    const canceledByCause = await ctx.db
      .query('canceledViolations')
      .withIndex('by_cause', (q) => q.eq('cause', args.cause))
      .collect();

    return canceledByCause.filter((item) => item.resolved !== true);
  },
});
