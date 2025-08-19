'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
interface ProfileData {
  budgetMax: number;
  safetySensitivity: number;
  costSensitivity: number;
  diversityPreference: 'mixed_high' | 'balanced' | 'community_cluster';
  politicsTolerance: 'aligned' | 'mixed_ok' | 'agnostic';
  climatePref: string;
  // Identity fields (optional)
  religion?: string;
  ethnicity?: string;
  lgbtq?: boolean;
}

export default function OnboardingPage() {
  const user = { firstName: 'Demo', emailAddresses: [{ emailAddress: 'demo@trueplace.com' }] }; // Mock user
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData>({
    budgetMax: 2000,
    safetySensitivity: 3,
    costSensitivity: 3,
    diversityPreference: 'balanced',
    politicsTolerance: 'mixed_ok',
    climatePref: 'moderate',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          <p className="text-gray-600">You need to be signed in to create your profile.</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // TODO: Save profile to Convex
    console.log('Profile completed:', profile);
    router.push('/app/quick');
  };

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">TruePlace</div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What's your housing budget?
              </h2>
              <p className="text-gray-600 mb-8">
                This helps us factor affordability into your TruePlace Score. We'll show 
                you places that fit your budget and highlight when costs exceed it.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum monthly housing budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      value={profile.budgetMax}
                      onChange={(e) => updateProfile({ budgetMax: parseInt(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2000"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Include rent/mortgage, utilities, and housing-related costs
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    How important is staying within budget? (1-5 scale)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={profile.costSensitivity}
                    onChange={(e) => updateProfile({ costSensitivity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Flexible</span>
                    <span className="font-medium">{profile.costSensitivity}/5</span>
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How important is personal safety?
              </h2>
              <p className="text-gray-600 mb-8">
                We use FBI crime data and hate crime statistics to assess community safety. 
                Your comfort level helps us weight these factors in your score.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Safety priority level (1-5 scale)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={profile.safetySensitivity}
                    onChange={(e) => updateProfile({ safetySensitivity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low concern</span>
                    <span className="font-medium">{profile.safetySensitivity}/5</span>
                    <span>Top priority</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Higher values will prioritize areas with lower crime rates and hate crime incidents
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What kind of community appeals to you?
              </h2>
              <p className="text-gray-600 mb-8">
                Tell us about your preferences for diversity and community culture. 
                This helps us find places where you're likely to feel welcome and represented.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Community diversity preference
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'mixed_high', label: 'High Diversity', desc: 'Very mixed communities with strong representation across groups' },
                      { value: 'balanced', label: 'Balanced Mix', desc: 'Moderately diverse with good representation' },
                      { value: 'community_cluster', label: 'Community Clusters', desc: 'Areas where my background/identity is well represented' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="diversity"
                          value={option.value}
                          checked={profile.diversityPreference === option.value}
                          onChange={(e) => updateProfile({ diversityPreference: e.target.value as any })}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Political climate preference
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'aligned', label: 'Politically Aligned', desc: 'Prefer areas that match my political views' },
                      { value: 'mixed_ok', label: 'Mixed is Fine', desc: 'Comfortable with diverse political perspectives' },
                      { value: 'agnostic', label: 'Not Important', desc: 'Political climate doesn\'t factor into my decision' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="politics"
                          value={option.value}
                          checked={profile.politicsTolerance === option.value}
                          onChange={(e) => updateProfile({ politicsTolerance: e.target.value as any })}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Optional: Additional preferences
              </h2>
              <p className="text-gray-600 mb-8">
                These details help us provide more personalized recommendations. 
                All information is kept private and used only for scoring calculations.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Climate preference
                  </label>
                  <select
                    value={profile.climatePref}
                    onChange={(e) => updateProfile({ climatePref: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="warm">Warm/Hot climates</option>
                    <option value="moderate">Moderate/Temperate</option>
                    <option value="cool">Cool/Cold climates</option>
                    <option value="any">No preference</option>
                  </select>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Identity & Background (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help us factor in representation and inclusion data relevant to your background. 
                    This information is encrypted and never shared.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Religious background (optional)
                      </label>
                      <input
                        type="text"
                        value={profile.religion || ''}
                        onChange={(e) => updateProfile({ religion: e.target.value })}
                        placeholder="e.g., Christian, Jewish, Muslim, Hindu, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ethnic background (optional)
                      </label>
                      <input
                        type="text"
                        value={profile.ethnicity || ''}
                        onChange={(e) => updateProfile({ ethnicity: e.target.value })}
                        placeholder="e.g., Hispanic/Latino, Black/African American, Asian, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="lgbtq"
                        checked={profile.lgbtq || false}
                        onChange={(e) => updateProfile({ lgbtq: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="lgbtq" className="text-sm font-medium text-gray-700">
                        I identify as LGBTQ+
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}