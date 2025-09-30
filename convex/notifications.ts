import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { components } from "./_generated/api";
import { getAuthenticatedUser } from "./auth/helpers";

const pushNotifications = new PushNotifications(components.pushNotifications, {
  logLevel: "DEBUG"
});

export const recordPushNotificationToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if(!user){
      throw Error("[Debug | notifications:recordPushNotification()]: Not Authenticated")
    }

    await pushNotifications.recordToken(ctx, {
      userId: user?._id,
      pushToken: args.token,
    });
  },
});

export const sendPushNotification = mutation({
  args: { title: v.string(), to: v.id("users"), body: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await pushNotifications.sendPushNotification(ctx, {
      userId: args.to,
      notification: {
        title: args.title,
        body: args.body
      },
    });
  },
});
