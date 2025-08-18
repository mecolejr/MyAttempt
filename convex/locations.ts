import { query } from "convex/server";
import { v } from "convex/values";

export const search = query({
  args: { 
    searchTerm: v.string(),
    level: v.optional(v.union(v.literal("state"), v.literal("county"), v.literal("city")))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("locations");
    
    if (args.level) {
      query = query.filter((q) => q.eq(q.field("level"), args.level));
    }

    const results = await query.collect();
    
    // Simple text search - in production you'd use a proper search index
    return results.filter(location => 
      location.name.toLowerCase().includes(args.searchTerm.toLowerCase())
    ).slice(0, 20); // Limit results
  },
});

export const getByGeokey = query({
  args: { geokey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locations")
      .withIndex("byKey", (q) => q.eq("geokey", args.geokey))
      .first();
  },
});