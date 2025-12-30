import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    passwordHash: v.string(),
    createdAt: v.number(),
    // Subscription fields
    subscriptionStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("canceled"),
      v.literal("past_due")
    )),
    polarCustomerId: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),
  }).index("by_email", ["email"])
    .index("by_polar_customer", ["polarCustomerId"]),

  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  knowledge: defineTable({
    documentId: v.id("documents"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
