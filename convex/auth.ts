import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple password hashing (in production, use bcrypt or similar)
function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use a proper password hashing library
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16) + password.length.toString(16);
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash: hashPassword(args.password),
      createdAt: Date.now(),
    });

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
    });

    return { token, userId };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash !== hashPassword(args.password)) {
      throw new Error("Invalid email or password");
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return { token, userId: user._id };
  },
});

export const signOut = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

export const getCurrentUser = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
  },
});

export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return { valid: false, userId: null };
    }

    return { valid: true, userId: session.userId };
  },
});

export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Build update object
    const updates: { name?: string; email?: string } = {};

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!.toLowerCase()))
        .first();

      if (existingUser && existingUser._id !== user._id) {
        throw new Error("Email is already in use");
      }

      updates.email = args.email.toLowerCase();
    }

    // Update user
    await ctx.db.patch(user._id, updates);

    return {
      _id: user._id,
      email: updates.email ?? user.email,
      name: updates.name ?? user.name,
    };
  },
});

// Check if user has an active subscription
export const checkSubscription = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return { hasSubscription: false, status: null };
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return { hasSubscription: false, status: null };
    }

    const isActive = 
      (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") &&
      (!user.subscriptionExpiresAt || user.subscriptionExpiresAt > Date.now());

    return {
      hasSubscription: isActive,
      status: user.subscriptionStatus ?? null,
      expiresAt: user.subscriptionExpiresAt ?? null,
    };
  },
});

// Update subscription status by email (called by webhook)
export const updateSubscriptionByEmail = mutation({
  args: {
    email: v.string(),
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    polarCustomerId: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      console.log("User not found for email:", args.email);
      return { success: false, error: "User not found" };
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      polarCustomerId: args.polarCustomerId,
      subscriptionExpiresAt: args.subscriptionExpiresAt,
    });

    return { success: true };
  },
});

// Debug: Get user by email to check subscription status
export const debugGetUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return { found: false, message: "User not found" };
    }

    return {
      found: true,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus ?? "none",
      polarCustomerId: user.polarCustomerId ?? "none",
      subscriptionExpiresAt: user.subscriptionExpiresAt 
        ? new Date(user.subscriptionExpiresAt).toISOString() 
        : "none",
      isActive: (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") &&
        (!user.subscriptionExpiresAt || user.subscriptionExpiresAt > Date.now()),
    };
  },
});

// Manually activate subscription (for testing/debugging)
export const debugActivateSubscription = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: "active",
      subscriptionExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { success: true, message: "Subscription activated" };
  },
});

// Get user with subscription info
export const getCurrentUserWithSubscription = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    const isSubscribed = 
      (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") &&
      (!user.subscriptionExpiresAt || user.subscriptionExpiresAt > Date.now());

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus ?? null,
      subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
      isSubscribed,
    };
  },
});
