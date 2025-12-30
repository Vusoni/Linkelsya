import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const knowledgeId = await ctx.db.insert("knowledge", {
      documentId: args.documentId,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    });
    return knowledgeId;
  },
});

export const listByDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    knowledgeId: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.knowledgeId);
  },
});

export const update = mutation({
  args: {
    knowledgeId: v.id("knowledge"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { knowledgeId, ...updates } = args;
    
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    
    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }

    if (Object.keys(updateData).length > 0) {
      await ctx.db.patch(knowledgeId, updateData);
    }
    
    return await ctx.db.get(knowledgeId);
  },
});

export const remove = mutation({
  args: {
    knowledgeId: v.id("knowledge"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.knowledgeId);
    return { success: true };
  },
});
