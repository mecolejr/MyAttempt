import { query, mutation } from "convex/server";
import { v } from "convex/values";

export const getForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    userId: v.id("users"),
    religion: v.optional(v.string()),
    ethnicity: v.optional(v.string()),
    lgbtq: v.optional(v.boolean()),
    diversityPreference: v.optional(v.union(
      v.literal("mixed_high"),
      v.literal("balanced"),
      v.literal("community_cluster")
    )),
    politicsTolerance: v.optional(v.union(
      v.literal("aligned"),
      v.literal("mixed_ok"),
      v.literal("agnostic")
    )),
    costSensitivity: v.optional(v.number()),
    safetySensitivity: v.optional(v.number()),
    climatePref: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .first();

    const profileData = {
      userId: args.userId,
      religion: args.religion,
      ethnicity: args.ethnicity,
      lgbtq: args.lgbtq,
      diversityPreference: args.diversityPreference,
      politicsTolerance: args.politicsTolerance,
      costSensitivity: args.costSensitivity,
      safetySensitivity: args.safetySensitivity,
      climatePref: args.climatePref,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
      return existing._id;
    } else {
      return await ctx.db.insert("profiles", profileData);
    }
  },
});