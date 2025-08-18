'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

// Mock user plan and saved places
const mockUserPlan = 'free';
const mockSavedPlaces = [
  {
    id: 1,
    name: 'Seattle',
    state: 'WA',
    score: 87,
    savedAt: '2024-01-15',
    alertEnabled: true,
    lastChange: '+2 points (Safety improved)',
  },
  {
    id: 2,
    name: 'Portland',
    state: 'OR',
    score: 79,
    savedAt: '2024-01-10',
    alertEnabled: false,
    lastChange: 'No changes',
  },
  {
    id: 3,
    name: 'Austin',
    state: 'TX',
    score: 73,
    savedAt: '2024-01-05',
    alertEnabled: true,
    lastChange: '-1 point (Housing costs up)',
  },
];

export default function SavedPlacesPage() {
  const { user } = useUser();
  const [savedPlaces, setSavedPlaces] = useState(mockSavedPlaces);

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your saved places.</p>
        </div>
      </div>
    );
  }

  // Premium gate for saved places
  if (mockUserPlan !== 'premium') {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">💾</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Saved Places & Alerts
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Keep track of your favorite locations and get notified when their TruePlace Scores change.
            </p>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Premium Features:</h3>
              <ul className="space-y-3 text-left text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  Save unlimited locations to your personal dashboard
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  Email alerts when scores change or new data is available
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  Monthly score updates for all your saved places
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  Compare saved locations side-by-side
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  Export saved places list with full data
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="bg-purple-500 text-white px-8 py-4 rounded-lg hover:bg-purple-600 transition-colors font-medium text-lg"
              >
                Upgrade to Premium
              </Link>
              <Link
                href="/app/quick"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium text-lg"
              >
                Back to Quick Look
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Start your free trial today • No commitment required
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleAlert = (id: number) => {
    setSavedPlaces(places =>
      places.map(place =>
        place.id === id ? { ...place, alertEnabled: !place.alertEnabled } : place
      )
    );
  };

  const removePlace = (id: number) => {
    setSavedPlaces(places => places.filter(place => place.id !== id));
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Saved Places</h1>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            Premium
          </span>
        </div>
        <p className="text-gray-600">
          Track your favorite locations and get alerted when their scores change.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Places</p>
              <p className="text-2xl font-bold text-gray-900">{savedPlaces.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💾</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {savedPlaces.filter(p => p.alertEnabled).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔔</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(savedPlaces.reduce((acc, p) => acc + p.score, 0) / savedPlaces.length)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link
          href="/app/quick"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
        >
          Find New Places
        </Link>
        <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          Compare All Saved
        </button>
        <button className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium">
          Export List
        </button>
      </div>

      {/* Saved Places List */}
      <div className="space-y-6">
        {savedPlaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">💾</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved places yet</h3>
            <p className="text-gray-600 mb-6">
              Start by saving locations from your Quick Look or Deep Dive analysis.
            </p>
            <Link
              href="/app/quick"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Locations
            </Link>
          </div>
        ) : (
          savedPlaces.map((place) => (
            <div key={place.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {place.name}, {place.state}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl font-bold text-green-600">{place.score}%</span>
                    <span className="text-sm text-gray-500">
                      Saved {new Date(place.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/app/deep?city=${place.name}&state=${place.state}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removePlace(place.id)}
                    className="text-red-600 hover:text-red-800 px-4 py-2 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`alert-${place.id}`}
                      checked={place.alertEnabled}
                      onChange={() => toggleAlert(place.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`alert-${place.id}`} className="text-sm font-medium text-gray-700">
                      Email alerts
                    </label>
                  </div>
                  {place.alertEnabled && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      🔔 Active
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Recent Changes</p>
                  <p className="text-xs text-gray-600">{place.lastChange}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}