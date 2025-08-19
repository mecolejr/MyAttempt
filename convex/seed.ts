import { mutation } from "convex/server";
import { v } from "convex/values";

// Mock data seeder for TruePlace MVP
export const seedMockData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingLocations = await ctx.db.query("locations").collect();
    if (existingLocations.length > 0) {
      return "Data already seeded";
    }

    const year = new Date().getFullYear();

    // Sample locations with realistic geo data
    const locations = [
      {
        geokey: "53033", // King County, WA (Seattle)
        name: "Seattle, WA",
        level: "city" as const,
        centroid: [-122.3321, 47.6062],
      },
      {
        geokey: "41051", // Multnomah County, OR (Portland)  
        name: "Portland, OR",
        level: "city" as const,
        centroid: [-122.6750, 45.5152],
      },
      {
        geokey: "48453", // Travis County, TX (Austin)
        name: "Austin, TX", 
        level: "city" as const,
        centroid: [-97.7431, 30.2672],
      },
      {
        geokey: "08031", // Denver County, CO
        name: "Denver, CO",
        level: "city" as const,
        centroid: [-104.9903, 39.7392],
      },
      {
        geokey: "13121", // Fulton County, GA (Atlanta)
        name: "Atlanta, GA",
        level: "city" as const,
        centroid: [-84.3880, 33.7490],
      },
      {
        geokey: "06075", // San Francisco County, CA
        name: "San Francisco, CA",
        level: "city" as const,
        centroid: [-122.4194, 37.7749],
      },
      {
        geokey: "36061", // New York County, NY (Manhattan)
        name: "New York, NY",
        level: "city" as const,
        centroid: [-73.9712, 40.7831],
      },
      {
        geokey: "17031", // Cook County, IL (Chicago)
        name: "Chicago, IL",
        level: "city" as const,
        centroid: [-87.6298, 41.8781],
      },
      {
        geokey: "25025", // Suffolk County, MA (Boston)
        name: "Boston, MA",
        level: "city" as const,
        centroid: [-71.0589, 42.3601],
      },
      {
        geokey: "04013", // Maricopa County, AZ (Phoenix)
        name: "Phoenix, AZ",
        level: "city" as const,
        centroid: [-112.0740, 33.4484],
      },
    ];

    // Sample metrics with realistic ranges
    const metricsData = [
      {
        geokey: "53033", // Seattle
        hateCrimesPer100k: 1.8,
        violentCrimesPer100k: 280,
        diversityIndex: 0.75,
        medianRent: 2400,
        unemploymentRate: 3.2,
        healthIndex: 78,
        dataConfidence: "high" as const,
      },
      {
        geokey: "41051", // Portland
        hateCrimesPer100k: 2.1,
        violentCrimesPer100k: 310,
        diversityIndex: 0.68,
        medianRent: 1950,
        unemploymentRate: 3.8,
        healthIndex: 74,
        dataConfidence: "high" as const,
      },
      {
        geokey: "48453", // Austin
        hateCrimesPer100k: 1.5,
        violentCrimesPer100k: 290,
        diversityIndex: 0.71,
        medianRent: 1850,
        unemploymentRate: 2.9,
        healthIndex: 72,
        dataConfidence: "high" as const,
      },
      {
        geokey: "08031", // Denver
        hateCrimesPer100k: 2.3,
        violentCrimesPer100k: 420,
        diversityIndex: 0.65,
        medianRent: 1750,
        unemploymentRate: 3.5,
        healthIndex: 76,
        dataConfidence: "med" as const,
      },
      {
        geokey: "13121", // Atlanta
        hateCrimesPer100k: 3.1,
        violentCrimesPer100k: 580,
        diversityIndex: 0.82,
        medianRent: 1600,
        unemploymentRate: 4.2,
        healthIndex: 68,
        dataConfidence: "med" as const,
      },
      {
        geokey: "06075", // San Francisco
        hateCrimesPer100k: 2.8,
        violentCrimesPer100k: 350,
        diversityIndex: 0.79,
        medianRent: 3500,
        unemploymentRate: 2.1,
        healthIndex: 81,
        dataConfidence: "high" as const,
      },
      {
        geokey: "36061", // New York
        hateCrimesPer100k: 4.2,
        violentCrimesPer100k: 420,
        diversityIndex: 0.85,
        medianRent: 3200,
        unemploymentRate: 4.1,
        healthIndex: 75,
        dataConfidence: "high" as const,
      },
      {
        geokey: "17031", // Chicago
        hateCrimesPer100k: 3.8,
        violentCrimesPer100k: 650,
        diversityIndex: 0.73,
        medianRent: 1900,
        unemploymentRate: 4.8,
        healthIndex: 69,
        dataConfidence: "high" as const,
      },
      {
        geokey: "25025", // Boston
        hateCrimesPer100k: 2.4,
        violentCrimesPer100k: 380,
        diversityIndex: 0.67,
        medianRent: 2800,
        unemploymentRate: 2.8,
        healthIndex: 79,
        dataConfidence: "high" as const,
      },
      {
        geokey: "04013", // Phoenix
        hateCrimesPer100k: 2.9,
        violentCrimesPer100k: 450,
        diversityIndex: 0.58,
        medianRent: 1400,
        unemploymentRate: 3.7,
        healthIndex: 71,
        dataConfidence: "med" as const,
      },
    ];

    // Insert locations
    for (const location of locations) {
      await ctx.db.insert("locations", location);
    }

    // Insert metrics
    for (const metrics of metricsData) {
      await ctx.db.insert("metrics", {
        ...metrics,
        year,
        sources: [
          "FBI Crime Data Explorer",
          "U.S. Census Bureau ACS 5-Year",
          "CDC PLACES",
        ],
        updatedAt: Date.now(),
      });
    }

    return `Seeded ${locations.length} locations and ${metricsData.length} metrics records`;
  },
});

// Helper to reseed data (development only)
export const clearAndReseed = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const locations = await ctx.db.query("locations").collect();
    const metrics = await ctx.db.query("metrics").collect();
    const scores = await ctx.db.query("scores").collect();

    for (const location of locations) {
      await ctx.db.delete(location._id);
    }
    for (const metric of metrics) {
      await ctx.db.delete(metric._id);
    }
    for (const score of scores) {
      await ctx.db.delete(score._id);
    }

    // Reseed
    return await ctx.runMutation("seed:seedMockData", {});
  },
});