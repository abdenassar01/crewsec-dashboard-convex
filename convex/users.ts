import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { authComponent, createAuth } from './auth';
import { getAuthenticatedUser, requireAdmin } from './auth/helpers';

// Query to get all users from Convex users table
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const users = await ctx.db
      .query('users')
      .order('desc')
      .paginate(args.paginationOpts);
    return users;
  },
});

export const getUsersByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const users = await ctx.db
      .query('users')
      .withIndex('by_role', (q) =>
        q.eq('role', args.role as 'EMPLOYEE' | 'CLIENT' | 'ADMIN'),
      )
      .order('desc')
      .collect();

    return users;
  },
});

// Query to get current user's profile from Convex users table
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    let user = await getAuthenticatedUser(ctx);

    if (!user) {
      // Return null instead of throwing to allow client-side handling
      return null;
    }

    // Generate avatar URL if user has an avatar image
    let avatarUrl = '';
    if (user.avatar) {
      try {
        avatarUrl = (await ctx.storage.getUrl(user.avatar)) || '';
      } catch (error) {
        console.error('Failed to get avatar URL:', error);
        avatarUrl = '';
      }
    }

    return { ...user, avatar: avatarUrl };
  },
});

// Query to get user by ID from Convex users table
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.userId);
  },
});

// Function to sync user from Better Auth to Convex users table
export const syncUserToTable = async (ctx: any, betterAuthUser: any) => {
  // Check if user already exists
  const existingUser = await ctx.db
    .query('users')
    .withIndex('by_email', (q: any) => q.eq('email', betterAuthUser.email))
    .unique();

  if (existingUser) {
    return existingUser._id;
  }

  // Create new user in Convex users table
  const userId = await ctx.db.insert('users', {
    email: betterAuthUser.email,
    name: betterAuthUser.name || betterAuthUser.email.split('@')[0],
    role: betterAuthUser.role || 'CLIENT',
    enabled: betterAuthUser.enabled ?? true,
    userId: betterAuthUser.id, // Store the Better Auth user ID
  });

  return userId;
};

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await createAuth(ctx).api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers: await authComponent.getHeaders(ctx),
    });
  },
});

export const getByAuthUserId = query({
  args: { authUserId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.authUserId))
      .unique();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    avatar: v.optional(v.id('_storage')),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Create user using Better Auth signup
    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
    });

    if (!session?.user?.id) {
      throw new Error('Failed to create user in Better Auth');
    }

    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      role: args.role,
      avatar: args.avatar,
      enabled: true,
      userId: session.user.id,
    });

    return userId;
  },
});

export const update = mutation({
  args: {
    userId: v.id('users'),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('ADMIN'),
      v.literal('EMPLOYEE'),
      v.literal('CLIENT'),
    ),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, {
      email: args.email,
      name: args.name,
      phone: args.phone,
      role: args.role,
      enabled: args.enabled,
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.userId);
  },
});
