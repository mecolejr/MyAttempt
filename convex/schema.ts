import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium")),
    createdAt: v.number(),
  }).index("byClerk", ["clerkUserId"]),

  profiles: defineTable({
    userId: v.id("users"),
    // identity & preferences (store minimally; allow anon profiles later)
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
    costSensitivity: v.optional(v.number()), // 0-1
    safetySensitivity: v.optional(v.number()), // 0-1
    climatePref: v.optional(v.string()),
    updatedAt: v.number()
  }).index("byUser", ["userId"]),

  locations: defineTable({
    // normalized geo key (e.g., GEOID or FIPS)
    geokey: v.string(),
    name: v.string(),     // "Dallas County, TX"
    level: v.union(v.literal("state"), v.literal("county"), v.literal("city")),
    centroid: v.optional(v.array(v.number())), // [lng, lat]
  }).index("byKey", ["geokey"]),

  metrics: defineTable({
    geokey: v.string(),
    year: v.number(),
    // example metrics; expand as needed
    hateCrimesPer100k: v.optional(v.number()),
    violentCrimesPer100k: v.optional(v.number()),
    diversityIndex: v.optional(v.number()),   // 0..100
    medianRent: v.optional(v.number()),
    unemploymentRate: v.optional(v.number()),
    healthIndex: v.optional(v.number()),      // 0..100 from CDC PLACES synthesis
    dataConfidence: v.optional(v.union(v.literal("low"), v.literal("med"), v.literal("high"))),
    sources: v.optional(v.array(v.string())),
    updatedAt: v.number(),
  }).index("byGeoYear", ["geokey", "year"]),

  scores: defineTable({
    userId: v.optional(v.id("users")), // optional for anon
    profileHash: v.string(),           // stable hash of prefs to cache
    geokey: v.string(),
    year: v.number(),
    composite: v.number(),             // 0..100
    dims: v.object({
      safety: v.number(),
      community: v.number(),
      costQuality: v.number(),
      climate: v.optional(v.number()),
      politics: v.optional(v.number())
    }),
    rationale: v.array(v.string()),    // short bullet lines
    createdAt: v.number()
  }).index("byProfileGeo", ["profileHash", "geokey"]),
});