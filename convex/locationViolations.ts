import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./auth/helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const locationViolations = await ctx.db.query("locationViolations").order("asc").collect();

    return await Promise.all(
      locationViolations.map(async (lv) => {
        const location = await ctx.db.get(lv.locationId);
        const violation = await ctx.db.get(lv.violationId);
        return {
          ...lv,
          location,
          violation,
        };
      })
    );
  },
});