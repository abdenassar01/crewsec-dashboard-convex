import { mutation } from "./_generated/server";
import { requireAdmin } from "./auth/helpers";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});