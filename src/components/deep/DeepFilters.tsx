"use client";

import { useEffect, useMemo, useState } from "react";

export type DeepFiltersValue = {
  // Core identity (preference weights, not identity capture)
  considerDimensions: string[]; // ["race_ethnicity", "religion", ...]
  safetyWeight: number; // 0..100
  communityWeight: number; // 0..100
  costQualityWeight: number; // 0..100

  // Socio‑economic positioning
  incomeRange: [number, number]; // monthly budget range
  educationLevel: "any" | "hs" | "some_college" | "bachelor" | "graduate";
  housingStatus: "any" | "renting" | "owning" | "public" | "unstable";
  caregiverRoles: string[]; // ["children", "elders", "disability"]

  // Access & inclusion signals
  policyProtections: string[]; // ["lgbtq", "fair_housing", "voting", ...]
  languageSupport: "any" | "bilingual_common" | "multilingual";
  healthAccessWeight: number; // 0..100
  airQualityWeight: number; // 0..100
  transitWalkWeight: number; // 0..100
};

type Props = {
  value?: DeepFiltersValue;
  onChange?: (next: DeepFiltersValue) => void;
};

const DEFAULTS: DeepFiltersValue = {
  considerDimensions: ["race_ethnicity", "gender_sex", "age", "religion", "sexual_orientation", "gender_identity"],
  safetyWeight: 50,
  communityWeight: 30,
  costQualityWeight: 20,

  incomeRange: [1500, 3000],
  educationLevel: "any",
  housingStatus: "any",
  caregiverRoles: [],

  policyProtections: ["fair_housing", "anti_discrimination"],
  languageSupport: "any",
  healthAccessWeight: 30,
  airQualityWeight: 20,
  transitWalkWeight: 20,
};

const STORAGE_KEY = "tp_deep_filters";

export default function DeepFilters({ value, onChange }: Props) {
  const [state, setState] = useState<DeepFiltersValue>(() => {
    if (value) return value;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return { ...DEFAULTS, ...JSON.parse(cached) } as DeepFiltersValue;
    } catch {}
    return DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    onChange?.(state);
  }, [state, onChange]);

  const set = <K extends keyof DeepFiltersValue>(key: K, val: DeepFiltersValue[K]) =>
    setState((s) => ({ ...s, [key]: val }));

  const toggleIn = (key: keyof DeepFiltersValue, val: string) => {
    setState((s) => {
      const next = new Set<string>(s[key] as string[]);
      if (next.has(val)) next.delete(val); else next.add(val);
      return { ...s, [key]: Array.from(next) } as DeepFiltersValue;
    });
  };

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="font-medium text-gray-900">Intersectional dimensions</div>
        <div className="text-gray-600">Select which dimensions you want the analysis to consider. These are used to weight public indicators, not to label you.</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            ["race_ethnicity", "Race & ethnicity"],
            ["gender_sex", "Gender & sex"],
            ["age", "Age"],
            ["religion", "Religion / spirituality"],
            ["sexual_orientation", "Sexual orientation"],
            ["gender_identity", "Gender identity"],
            ["disability", "Disability (visible/invisible)"],
            ["mental_health", "Mental health / neurodiversity"],
          ].map(([id, label]) => (
            <label key={id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.considerDimensions.includes(id)}
                onChange={() => toggleIn("considerDimensions", id)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-medium text-gray-900">Preference weights</div>
        <div className="grid gap-4">
          {(
            [
              ["safetyWeight", "Safety (crime & hate‑crime indicators)"] as const,
              ["communityWeight", "Community (diversity & representation)"] as const,
              ["costQualityWeight", "Cost & quality (rent, health index, jobs)"] as const,
            ]
          ).map(([k, label]) => (
            <div key={k}>
              <div className="flex items-center justify-between mb-1"><span>{label}</span><span>{state[k]}%</span></div>
              <input type="range" min={0} max={100} value={state[k]} onChange={(e) => set(k, Number(e.target.value) as any)} className="w-full" />
            </div>
          ))}
          <div className="text-xs text-gray-500">Weights are normalized when scoring.</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-medium text-gray-900">Socio‑economic context</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Monthly housing budget</label>
            <div className="flex items-center gap-2">
              <input type="number" value={state.incomeRange[0]} onChange={(e) => set("incomeRange", [Number(e.target.value), state.incomeRange[1]])} className="w-28 px-2 py-1 border rounded" />
              <span>to</span>
              <input type="number" value={state.incomeRange[1]} onChange={(e) => set("incomeRange", [state.incomeRange[0], Number(e.target.value)])} className="w-28 px-2 py-1 border rounded" />
            </div>
          </div>
          <div>
            <label className="block mb-1">Education level</label>
            <select value={state.educationLevel} onChange={(e) => set("educationLevel", e.target.value as any)} className="w-full px-2 py-2 border rounded">
              <option value="any">Any</option>
              <option value="hs">High school</option>
              <option value="some_college">Some college</option>
              <option value="bachelor">Bachelor's</option>
              <option value="graduate">Graduate</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Housing status</label>
            <select value={state.housingStatus} onChange={(e) => set("housingStatus", e.target.value as any)} className="w-full px-2 py-2 border rounded">
              <option value="any">Any</option>
              <option value="renting">Renting</option>
              <option value="owning">Owning</option>
              <option value="public">Public/assisted</option>
              <option value="unstable">Unstable / at risk</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Caregiver roles</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["children", "Children"],
                ["elders", "Elders"],
                ["disability", "Disability"],
              ].map(([id, label]) => (
                <label key={id} className="flex items-center gap-2">
                  <input type="checkbox" checked={state.caregiverRoles.includes(id)} onChange={() => toggleIn("caregiverRoles", id)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="font-medium text-gray-900">Access & inclusion preferences</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Policy protections</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["anti_discrimination", "Anti‑discrimination"],
                ["fair_housing", "Fair housing"],
                ["lgbtq", "LGBTQ protections"],
                ["voting", "Voting access"],
              ].map(([id, label]) => (
                <label key={id} className="flex items-center gap-2">
                  <input type="checkbox" checked={(state.policyProtections).includes(id)} onChange={() => toggleIn("policyProtections", id)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1">Language support</label>
            <select value={state.languageSupport} onChange={(e) => set("languageSupport", e.target.value as any)} className="w-full px-2 py-2 border rounded">
              <option value="any">Any</option>
              <option value="bilingual_common">Bilingual (English + common second language)</option>
              <option value="multilingual">Multilingual services preferred</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 mt-2">
          {(
            [
              ["healthAccessWeight", "Healthcare access & outcomes"] as const,
              ["airQualityWeight", "Air quality / environmental comfort"] as const,
              ["transitWalkWeight", "Transit & walkability"] as const,
            ]
          ).map(([k, label]) => (
            <div key={k}>
              <div className="flex items-center justify-between mb-1"><span>{label}</span><span>{state[k]}%</span></div>
              <input type="range" min={0} max={100} value={state[k]} onChange={(e) => set(k, Number(e.target.value) as any)} className="w-full" />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 pt-2">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={() => setState(DEFAULTS)}
        >
          Restore defaults
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state))}
        >
          Save preset (local)
        </button>
      </div>
    </div>
  );
}


