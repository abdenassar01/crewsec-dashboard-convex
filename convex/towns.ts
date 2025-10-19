import { v } from 'convex/values';

import { query } from './_generated/server';
import { requireAdmin } from './auth/helpers';

// Query to get all towns
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query('towns').order('asc').collect();
  },
});

// Query to get all towns
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (!args.query) return await ctx.db.query('towns').order('asc').collect();
    return await ctx.db
      .query('towns')
      .withSearchIndex('by_label', (q) => q.search('label', args.query))
      .collect();
  },
});
