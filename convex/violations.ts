import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./auth/helpers";

// Query to get all violations
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("violations").order("asc").collect();
  },
});