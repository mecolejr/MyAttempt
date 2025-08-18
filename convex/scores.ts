import { query, mutation } from "convex/server";
import { v } from "convex/values";

export const forProfile = query({
  args: { 
    profileHash: v.string(),
    year: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const year = args.year || new Date().getFullYear();
    
    return await ctx.db
      .query("scores")
      .withIndex("byProfileGeo", (q) => q.eq("profileHash", args.profileHash))
      .filter((q) => q.eq(q.field("year"), year))
      .collect();
  },
});

export const topMatches = query({
  args: { 
    profileHash: v.string(),
    level: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const year = new Date().getFullYear();
    
    const scores = await ctx.db
      .query("scores")
      .withIndex("byProfileGeo", (q) => q.eq("profileHash", args.profileHash))
      .filter((q) => q.eq(q.field("year"), year))
      .order("desc")
      .take(limit);

    // Join with location data
    const results = await Promise.all(
      scores.map(async (score) => {
        const location = await ctx.db
          .query("locations")
          .withIndex("byKey", (q) => q.eq("geokey", score.geokey))
          .first();
        
        return {
          ...score,
          location,
        };
      })
    );

    return results.filter(r => r.location); // Only return scores with valid locations
  },
});

export const detail = query({
  args: { 
    profileHash: v.string(),
    geokey: v.string(),
    year: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const year = args.year || new Date().getFullYear();
    
    const score = await ctx.db
      .query("scores")
      .withIndex("byProfileGeo", (q) => q.eq("profileHash", args.profileHash))
      .filter((q) => 
        q.and(
          q.eq(q.field("geokey"), args.geokey),
          q.eq(q.field("year"), year)
        )
      )
      .first();

    if (!score) return null;

    // Join with location and metrics data
    const location = await ctx.db
      .query("locations")
      .withIndex("byKey", (q) => q.eq("geokey", args.geokey))
      .first();

    const metrics = await ctx.db
      .query("metrics")
      .withIndex("byGeoYear", (q) => q.eq("geokey", args.geokey).eq("year", year))
      .first();

    return {
      ...score,
      location,
      metrics,
    };
  },
});