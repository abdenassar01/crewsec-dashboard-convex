import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { requireAdmin } from './auth/helpers';

const controlFeeStatus = v.union(
  v.literal('AWAITING'),
  v.literal('PAID'),
  v.literal('CANCELED'),
  v.literal('CONFLICT'),
);

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    townId: v.optional(v.id('towns')),
    violationId: v.optional(v.id('violations')), // Simplified to filter by Violation, not LocationViolation
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const feesQuery = ctx.db.query('controlFees');

    if (args.townId) {
      feesQuery.withIndex('by_townId', (q) => q.eq('townId', args.townId!));
    }

    if (args.violationId) {
      const locationViolations = await ctx.db
        .query('locationViolations')
        .withIndex('by_violationId', (q) =>
          q.eq('violationId', args.violationId!),
        )
        .collect();
      const lvIds = locationViolations.map((lv) => lv._id);

      return (await feesQuery.collect())
        .filter((fee) => lvIds.includes(fee.locationViolationId))
        .slice(
          args.paginationOpts.numItems *
            (args.paginationOpts.cursor
              ? parseInt(args.paginationOpts.cursor)
              : 0),
          args.paginationOpts.numItems,
        );
    }

    return await feesQuery.order('desc').paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    reference: v.string(),
    mark: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isSignsChecked: v.boolean(),
    isPhotosTaken: v.boolean(),
    status: controlFeeStatus,
    townId: v.id('towns'),
    locationViolationId: v.id('locationViolations'),
    galleryStorageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert('controlFees', args);
  },
});

export const update = mutation({
  args: {
    id: v.id('controlFees'),
    reference: v.string(),
    mark: v.string(),
    status: controlFeeStatus,
    isSignsChecked: v.boolean(),
    isPhotosTaken: v.boolean(),
    galleryStorageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const deleteFee = mutation({
  args: { id: v.id('controlFees') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const fee = await ctx.db.get(args.id);
    // Delete associated images from storage
    if (fee && fee.galleryStorageIds) {
      await Promise.all(
        fee.galleryStorageIds.map((id) => ctx.storage.delete(id)),
      );
    }
    await ctx.db.delete(args.id);
  },
});
