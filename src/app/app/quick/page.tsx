"use client";

import { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuickMatch {
  name: string;
  state: string;
  score: number;
  rationale: string[];
  keyStats: {
    medianRent: number;
    safetyScore: number;
    diversityIndex: number;
  };
}

const mockMatches: QuickMatch[] = [
  {
    name: "Seattle",
    state: "WA",
    score: 87,
    rationale: [
      "High diversity and strong LGBTQ+ protections",
      "Above-average safety with low hate crime rates",
      "Housing costs fit within expanded budget range"
    ],
    keyStats: {
      medianRent: 2200,
      safetyScore: 82,
      diversityIndex: 0.73
    }
  },
  {
    name: "Portland",
    state: "OR",
    score: 79,
    rationale: [
      "Progressive community with high inclusion scores",
      "Moderate housing costs relative to quality of life",
      "Strong public transit and walkability"
    ],
    keyStats: {
      medianRent: 1850,
      safetyScore: 75,
      diversityIndex: 0.68
    }
  },
  {
    name: "Austin",
    state: "TX",
    score: 73,
    rationale: [
      "Growing tech scene with cultural opportunities",
      "Reasonable cost of living for a major city",
      "Mixed political climate in progressive city pockets"
    ],
    keyStats: {
      medianRent: 1650,
      safetyScore: 71,
      diversityIndex: 0.61
    }
  }
];

export default function QuickLookPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const Map = dynamic(() => import('@/components/Map'), { ssr: false });
  const [welcome, setWelcome] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Array<{ name: string; state: string }>>([]);

  // Minimal geocodes for demo markers
  const cityToLonLat: Record<string, [number, number]> = {
    Seattle: [-122.335167, 47.608013],
    Portland: [-122.676483, 45.523064],
    Austin: [-97.743057, 30.267153],
  };

  const scoreToColor = (score: number) => {
    if (score >= 80) return '#16a34a'; // green-600
    if (score >= 70) return '#f59e0b'; // amber-500
    return '#dc2626'; // red-600
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to access your TruePlace scores.</p>
        </div>
      </div>
    );
  }

  const descriptor = (score: number) => score >= 85 ? "Excellent Fit" : score >= 75 ? "Good Fit" : score >= 65 ? "Partial Fit" : "Low Fit";
  const costFromRent = (rent: number) => Math.max(40, Math.min(90, Math.round(120 - rent / 30)));

  useEffect(() => {
    const last = localStorage.getItem('tp_last_city');
    if (user?.firstName) setWelcome(`Welcome back, ${user.firstName}.`);
    else if (last) setWelcome(`Welcome back. Your last viewed city was ${last}.`);
    const fav = JSON.parse(localStorage.getItem('tp_favorites') || '[]');
    setFavorites(fav);
  }, [user]);

  const isFavorite = (name: string, state: string) => favorites.some(f => f.name === name && f.state === state);
  const toggleFavorite = (name: string, state: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.name === name && f.state === state);
      const next = exists ? prev.filter(f => !(f.name === name && f.state === state)) : [...prev, { name, state }];
      localStorage.setItem('tp_favorites', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (mockMatches.length > 0) {
      const top = mockMatches[0];
      localStorage.setItem('tp_last_city', `${top.name}, ${top.state}`);
    }
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Quick Look</h1>
        <p className="text-gray-600">
          {welcome ? welcome : "Based on your preferences, here are the places where you're most likely to feel at home."}
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={() => setLoading(true)}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Updating Scores...' : 'Refresh Scores'}
        </button>
        <Link 
          href="/app/deep"
          className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center"
        >
          Deep Dive Analysis →
        </Link>
        <Link 
          href="/onboarding"
          className="text-gray-600 hover:text-gray-800 px-6 py-3 font-medium text-center"
        >
          Update Preferences
        </Link>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Heat Map View</h2>
        <div className="rounded-lg overflow-hidden border" style={{ height: 420 }}>
          <Map
            markers={mockMatches
              .filter(m => cityToLonLat[m.name as keyof typeof cityToLonLat])
              .map(m => {
                const [lon, lat] = cityToLonLat[m.name as keyof typeof cityToLonLat];
                return {
                  lon,
                  lat,
                  color: scoreToColor(m.score),
                  label: `${m.name}, ${m.state} — ${m.score}%`,
                };
              })}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#16a34a' }}></span> High</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></span> Medium</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#dc2626' }}></span> Lower</div>
        </div>
      </div>

      {/* Top Matches */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Top Matches</h2>
        
        {mockMatches.map((match, index) => (
          <div key={`${match.name}-${match.state}`} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  #{index + 1} {match.name}, {match.state}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-green-600">{match.score}%</span>
                  <span className="text-gray-600">TruePlace Score · {descriptor(match.score)}</span>
                  <Dialog>
                    <DialogTrigger className="text-blue-600 underline text-sm">Why?</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Why this score?</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p>Score {match.score} = Safety {match.keyStats.safetyScore} (50%) + Community {Math.round(match.keyStats.diversityIndex * 100)}% (30%) + Cost {costFromRent(match.keyStats.medianRent)} (20%).</p>
                        <ul className="list-disc list-inside">{match.rationale.map(r => <li key={r}>{r}</li>)}</ul>
                        <div className="pt-2 text-xs text-gray-500">Indicators, not guarantees; individual experiences vary.</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(match.name, match.state)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${isFavorite(match.name, match.state) ? 'bg-pink-600 text-white border-pink-600' : 'hover:bg-gray-50'}`}
                  aria-label={isFavorite(match.name, match.state) ? 'Remove from favorites' : 'Save to favorites'}
                >
                  {isFavorite(match.name, match.state) ? '♥ Saved' : '♡ Save'}
                </button>
                <Link
                  href={`/app/deep?city=${match.name}&state=${match.state}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">{match.keyStats.safetyScore}</div>
                <div className="text-xs text-green-600">Safety Score</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg" title="The Diversity Index is the probability that two randomly selected people are from different racial/ethnic groups. Higher means more diverse.">
                <div className="text-lg font-bold text-blue-700">
                  {Math.round(match.keyStats.diversityIndex * 100)}%
                </div>
                <div className="text-xs text-blue-600">Diversity Index</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-700">
                  ${match.keyStats.medianRent.toLocaleString()}
                </div>
                <div className="text-xs text-purple-600">Median Rent</div>
              </div>
            </div>

            {/* Rationale */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Why this might be a good fit:</h4>
              <ul className="space-y-1">
                {match.rationale.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Citations */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  📊 FBI Crime Data
                </span>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  🏠 Census Housing
                </span>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  🏥 CDC Health Data
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Remember:</strong> TruePlace Scores are indicators based on aggregate data, not guarantees. 
          Individual experiences vary greatly. Always visit and research locations in person before making major decisions.
        </p>
      </div>
    </div>
  );
}