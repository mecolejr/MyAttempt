import { NextRequest, NextResponse } from 'next/server';
import { LocationScorer, UserPreferences, LocationData } from '@/lib/scoring';
import governmentDataService from '@/lib/services/governmentData';

// Mock location data - in production this would come from a database
const mockLocations: LocationData[] = [
  { name: 'Seattle', state: 'WA', mobility: true, inclusion: true },
  { name: 'Portland', state: 'OR', mobility: true, inclusion: true },
  { name: 'Austin', state: 'TX', mobility: false, inclusion: true },
  { name: 'Denver', state: 'CO', mobility: false, inclusion: true },
  { name: 'San Francisco', state: 'CA', mobility: true, inclusion: true },
  { name: 'Minneapolis', state: 'MN', mobility: false, inclusion: true },
  { name: 'Atlanta', state: 'GA', mobility: false, inclusion: false },
  { name: 'Nashville', state: 'TN', mobility: false, inclusion: false }
];

export async function POST(request: NextRequest) {
  try {
    const preferences: UserPreferences = await request.json();

    if (!preferences.budgetMax || !preferences.weights) {
      return NextResponse.json(
        { error: 'Budget and weights are required' },
        { status: 400 }
      );
    }

    // Enrich locations with live government data
    const enrichedLocations = await Promise.all(
      mockLocations.map(async (location) => {
        try {
          const govData = await governmentDataService.getGovernmentData(
            location.name, 
            location.state, 
            'comprehensive'
          );

          return {
            ...location,
            census: govData.census,
            crime: govData.crime,
            health: govData.health,
            sustainability: govData.sustainability
          };
        } catch (error) {
          console.error(`Error enriching ${location.name}:`, error);
          // Return location with mock data if API fails
          return {
            ...location,
            census: {
              medianRent: Math.floor(Math.random() * 2000) + 1000,
              diversityIndex: Math.random() * 0.8 + 0.1
            },
            crime: {
              safetyScore: Math.floor(Math.random() * 40) + 60
            }
          };
        }
      })
    );

    // Score and rank locations
    const scorer = new LocationScorer();
    const scoredLocations = scorer.scoreLocations(enrichedLocations, preferences);

    // Format response with compatibility scores and contributions
    const results = scoredLocations.map(location => ({
      name: location.name,
      state: location.state,
      compatibilityScore: Math.round(location.score * 100),
      contributions: {
        safety: Math.round(location.contributions.safety * 100),
        affordability: Math.round(location.contributions.affordability * 100),
        diversity: Math.round(location.contributions.diversity * 100),
        mobility: Math.round(location.contributions.mobility * 100),
        inclusion: Math.round(location.contributions.inclusion * 100)
      },
      data: {
        medianRent: location.census?.medianRent,
        safetyScore: location.crime?.safetyScore,
        diversityIndex: location.census?.diversityIndex,
        hasGoodTransit: location.mobility,
        inclusionFriendly: location.inclusion
      }
    }));

    return NextResponse.json({
      matches: results,
      preferences,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { error: 'Failed to process location matching' },
      { status: 500 }
    );
  }
}