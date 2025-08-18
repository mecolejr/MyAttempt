'use client';

import { useState } from 'react';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

interface UserPreferences {
  budgetMax: number;
  weights: {
    safety: number;
    affordability: number;
    diversity: number;
    mobility: number;
    inclusion: number;
  };
}

interface MatchResult {
  name: string;
  state: string;
  compatibilityScore: number;
  contributions: {
    safety: number;
    affordability: number;
    diversity: number;
    mobility: number;
    inclusion: number;
  };
  data: {
    medianRent?: number;
    safetyScore?: number;
    diversityIndex?: number;
    hasGoodTransit?: boolean;
    inclusionFriendly?: boolean;
  };
}

export default function TruePlace() {
  const [step, setStep] = useState<'preferences' | 'results' | 'analytics'>('preferences');
  const [preferences, setPreferences] = useState<UserPreferences>({
    budgetMax: 2000,
    weights: {
      safety: 3,
      affordability: 4,
      diversity: 3,
      mobility: 2,
      inclusion: 3
    }
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; state: string } | null>(null);

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setMatches(data.matches);
      setStep('results');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (city: string, state: string) => {
    setSelectedLocation({ city, state });
    setStep('analytics');
  };

  if (step === 'analytics' && selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => setStep('results')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Results
            </button>
          </div>
        </div>
        <AdvancedAnalytics city={selectedLocation.city} state={selectedLocation.state} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TruePlace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find where you'll truly feel at home. Get personalized location recommendations 
            based on safety, affordability, diversity, and your unique preferences.
          </p>
        </div>

        {step === 'preferences' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us what matters to you</h2>
            
            {/* Budget */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Monthly Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={preferences.budgetMax}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    budgetMax: parseInt(e.target.value) || 0
                  }))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000"
                />
              </div>
            </div>

            {/* Weights */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                How important are these factors? (1-5 scale)
              </h3>
              <div className="space-y-6">
                {Object.entries(preferences.weights).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key === 'affordability' ? 'Affordability' : 
                         key === 'mobility' ? 'Public Transit' :
                         key === 'inclusion' ? 'LGBTQ+ Friendly' : 
                         key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <span className="text-sm text-gray-500">{value}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={value}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        weights: {
                          ...prev.weights,
                          [key]: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Not important</span>
                      <span>Very important</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Finding your perfect places...' : 'Get My Recommendations'}
            </button>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Recommendations</h2>
              <button
                onClick={() => setStep('preferences')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Update Preferences
              </button>
            </div>

            <div className="grid gap-6">
              {matches.map((match, index) => (
                <div key={`${match.name}-${match.state}`} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        #{index + 1} {match.name}, {match.state}
                      </h3>
                      <p className="text-lg text-blue-600 font-medium">
                        {match.compatibilityScore}% Compatibility
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(match.name, match.state)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{match.contributions.safety}</div>
                      <div className="text-xs text-gray-500">Safety</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{match.contributions.affordability}</div>
                      <div className="text-xs text-gray-500">Affordability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{match.contributions.diversity}</div>
                      <div className="text-xs text-gray-500">Diversity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{match.contributions.mobility}</div>
                      <div className="text-xs text-gray-500">Transit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">{match.contributions.inclusion}</div>
                      <div className="text-xs text-gray-500">Inclusion</div>
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Median Rent:</span>
                      <div className="font-medium">
                        {match.data.medianRent ? `$${match.data.medianRent.toLocaleString()}` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Safety Score:</span>
                      <div className="font-medium">{match.data.safetyScore || 'N/A'}/100</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Good Transit:</span>
                      <div className="font-medium">{match.data.hasGoodTransit ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">LGBTQ+ Friendly:</span>
                      <div className="font-medium">{match.data.inclusionFriendly ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {matches.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No recommendations found. Try adjusting your preferences.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}