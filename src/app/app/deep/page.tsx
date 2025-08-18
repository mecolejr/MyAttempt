"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import DeepFilters, { type DeepFiltersValue } from "@/components/deep/DeepFilters";
import { useMemo, useState } from "react";

const mockUserPlan = "premium"; // replace with Convex user plan later

export default function DeepDivePage() {
  const { user } = useUser();
  // Hooks must be unconditionally called in the same order across renders
  // Reactive charts driven by filters
  const [filters, setFilters] = useState<DeepFiltersValue | undefined>(undefined);

  // Baseline demo dimensions (0..100)
  const base = { safety: 78, community: 72, costQuality: 66 };

  const dims = useMemo(() => {
    if (!filters) return base;
    const total = Math.max(1, filters.safetyWeight + filters.communityWeight + filters.costQualityWeight);
    const ws = filters.safetyWeight / total;
    const wc = filters.communityWeight / total;
    const wq = filters.costQualityWeight / total;
    const emphasize = (val: number, w: number) => Math.round(Math.min(100, Math.max(0, val * (0.8 + w * 0.4))));
    const envBoost = (filters.airQualityWeight + filters.transitWalkWeight) / 200;
    const healthBoost = filters.healthAccessWeight / 100;
    return {
      safety: emphasize(base.safety, ws),
      community: emphasize(base.community, wc),
      costQuality: emphasize(Math.round(base.costQuality * (0.9 + envBoost * 0.2 + healthBoost * 0.2)), wq),
    };
  }, [filters]);

  const safetySeries = useMemo(() => [68, 65, 70, 76, dims.safety].map((y, i) => ({ x: `${2019 + i}`, y })), [dims.safety]);
  const cqSeries = useMemo(() => [58, 60, 62, 61, dims.costQuality].map((y, i) => ({ x: `${2019 + i}`, y })), [dims.costQuality]);

  const ScoreRadar = useMemo(() => dynamic(() => import("@/components/charts/ScoreRadar"), { ssr: false }), []);
  const TrendLine = useMemo(() => dynamic(() => import("@/components/charts/TrendLine"), { ssr: false }), []);

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to access Deep Dive analytics.</p>
        </div>
      </div>
    );
  }

  if (mockUserPlan !== "premium") {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⭐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Deep Dive Analytics</h1>
            <p className="text-lg text-gray-700 mb-6">
              Unlock detailed insights, trend analysis, neighborhood zoom, and advanced filters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="bg-yellow-500 text-white px-8 py-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-lg">
                Upgrade to Premium - $19/month
              </Link>
              <Link href="/app/quick" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium text-lg">
                Back to Quick Look
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">7-day free trial • Cancel anytime</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Deep Dive</h1>
      <p className="text-gray-600 mb-6">Advanced filters, charts, and citations.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Score Breakdown</h2>
            <span className="text-xs text-gray-500">Tip: click radar axes to adjust weights</span>
          </div>
          <ScoreRadar
            safety={dims.safety}
            community={dims.community}
            costQuality={dims.costQuality}
            onAdjust={(dim, delta = 5) => {
              if (!filters) return;
              const map: Record<string, keyof DeepFiltersValue> = {
                "Safety": "safetyWeight",
                "Community": "communityWeight",
                "Cost & Quality": "costQualityWeight",
              };
              const key = map[dim];
              const next = Math.max(0, Math.min(100, (filters as any)[key] + delta));
              setFilters({ ...filters, [key]: next } as any);
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deep Filters</h2>
          <DeepFilters value={filters} onChange={setFilters} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trend: Safety</h2>
            <span className="text-xs text-gray-500">Click points to nudge Safety weight</span>
          </div>
          <TrendLine
            label="Safety"
            series={safetySeries}
            color="#16a34a"
            onAdjustPoint={() => {
              if (!filters) return;
              // Clicking a point nudges Safety weight up slightly
              const next = Math.min(100, filters.safetyWeight + 5);
              setFilters({ ...filters, safetyWeight: next });
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trend: Cost & Quality</h2>
            <span className="text-xs text-gray-500">Click points to nudge Health/Air weights</span>
          </div>
          <TrendLine
            label="Cost & Quality"
            series={cqSeries}
            color="#2563eb"
            onAdjustPoint={() => {
              if (!filters) return;
              // Clicking a point nudges environment/health knobs
              const air = Math.min(100, filters.airQualityWeight + 5);
              const health = Math.min(100, filters.healthAccessWeight + 5);
              setFilters({ ...filters, airQualityWeight: air, healthAccessWeight: health });
            }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Citations</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>FBI Crime Data Explorer — <a href="https://cde.ucr.cjis.gov/" className="text-blue-600 underline" target="_blank" rel="noreferrer">cde.ucr.cjis.gov</a></li>
          <li>U.S. Census Bureau ACS — <a href="https://data.census.gov/" className="text-blue-600 underline" target="_blank" rel="noreferrer">data.census.gov</a></li>
          <li>CDC PLACES — <a href="https://www.cdc.gov/places/" className="text-blue-600 underline" target="_blank" rel="noreferrer">cdc.gov/places</a></li>
        </ul>
        </div>
      </div>
    </div>
  );
}