import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      userId: args.userId,
      title: args.title || "Untitled Document",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return documentId;
  },
});

export const get = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    
    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    
    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    
    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }

    await ctx.db.patch(documentId, updateData);
    return await ctx.db.get(documentId);
  },
});

export const remove = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    // Delete all knowledge items for this document
    const knowledgeItems = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const item of knowledgeItems) {
      await ctx.db.delete(item._id);
    }

    // Delete the document
    await ctx.db.delete(args.documentId);
    return { success: true };
  },
});
