import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              TruePlace
            </Link>
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TruePlace Demo
          </h1>
          <p className="text-xl text-gray-600">
            Experience how TruePlace helps you find where you truly belong using real government data.
          </p>
        </div>

        {/* Demo Flow */}
        <div className="space-y-12">
          {/* Step 1: Profile */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Your Profile</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sample Profile</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">$2,000/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safety Priority:</span>
                    <span className="font-medium">High (5/5)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diversity Preference:</span>
                    <span className="font-medium">High Diversity</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Political Climate:</span>
                    <span className="font-medium">Mixed OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Identity:</span>
                    <span className="font-medium">LGBTQ+ Friendly Important</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">How It Works</h4>
                <p className="text-sm text-gray-600">
                  TruePlace uses your preferences to weight different factors when calculating 
                  your personalized compatibility score for any location in America.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Scoring */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Data-Driven Scoring</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">Safety (50%)</div>
                <p className="text-sm text-gray-600">FBI crime data, hate crime statistics</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">Community (30%)</div>
                <p className="text-sm text-gray-600">Census diversity, representation data</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">Cost/Quality (20%)</div>
                <p className="text-sm text-gray-600">HUD housing costs, CDC health data</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-2">Transparent Algorithm</h4>
              <p className="text-sm text-gray-600">
                Every score shows its calculation with full source citations. No black boxes—
                just verifiable government data processed through our explainable algorithm.
              </p>
            </div>
          </div>

          {/* Step 3: Results */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Your Results</h2>
            <div className="space-y-4">
              {/* Seattle Result */}
              <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">#1 Seattle, WA</h3>
                    <div className="text-2xl font-bold text-green-600">87% Match</div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Median Rent: $2,200</div>
                    <div>Safety Score: 82/100</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    High diversity (73%) with strong LGBTQ+ protections
                  </p>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    Above-average safety with low hate crime rates
                  </p>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    Housing costs within expanded budget range
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded">📊 FBI CDE</span>
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded">🏠 Census ACS</span>
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded">🏥 CDC PLACES</span>
                  </div>
                </div>
              </div>

              {/* Austin Result */}
              <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">#2 Austin, TX</h3>
                    <div className="text-2xl font-bold text-blue-600">73% Match</div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Median Rent: $1,650</div>
                    <div>Safety Score: 71/100</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    Growing tech scene with cultural opportunities
                  </p>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    Reasonable cost of living for a major city
                  </p>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    Mixed political climate in progressive city pockets
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to find your TruePlace?
            </h2>
            <p className="text-gray-600 mb-6">
              Sign up free to create your personalized profile and discover 
              where you'll truly feel at home.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg inline-block"
            >
              Get Started Free
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Upgrade to Premium for $19/month when ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}