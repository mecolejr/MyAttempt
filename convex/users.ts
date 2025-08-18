import { query, mutation } from "convex/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byClerk", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
  },
});

export const syncClerkUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    plan: v.optional(v.union(v.literal("free"), v.literal("premium")))
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("byClerk", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const userData = {
      clerkUserId: args.clerkUserId,
      email: args.email,
      plan: args.plan || "free",
      createdAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        plan: args.plan || existing.plan,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", userData);
    }
  },
});

export const updatePlan = mutation({
  args: {
    clerkUserId: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium"))
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerk", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { plan: args.plan });
    return user._id;
  },
});