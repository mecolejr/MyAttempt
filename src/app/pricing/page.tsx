import Link from "next/link";
import { SignUpButton, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              TruePlace
            </Link>
            <div className="flex gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-gray-900 font-medium">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Get Started</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/app/quick" className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">Open App</Link>
                <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your TruePlace Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Start with our free plan and upgrade when you need more detailed insights 
          and real-time data updates.
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <div className="text-gray-600">per month</div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Annual TruePlace Score updates</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">State and county-level data</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Basic score breakdown</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Full data source citations</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Compare up to 5 locations</span>
              </div>
            </div>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium">Get Started Free</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app/quick" className="w-full inline-block text-center border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">Open App</Link>
            </SignedIn>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                $19<span className="text-lg text-gray-600">/month</span>
              </div>
              <div className="text-gray-600">billed annually</div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Everything in Free, plus:
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Monthly data refreshes</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Neighborhood-level zoom (top metros)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">3-5 year trend analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-anchor mt-1"></div>
                </div>
                <span className="text-gray-700">Email alerts for score changes</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Advanced filter controls</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">PDF reports export</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mt-1"></div>
                </div>
                <span className="text-gray-700">Unlimited saved searches</span>
              </div>
            </div>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Upgrade to Premium</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app/deep" className="w-full inline-block text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Go to Deep Dive</Link>
            </SignedIn>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How accurate is the TruePlace Score?
              </h3>
              <p className="text-gray-600">
                Our scores are based on official government data from FBI, Census Bureau, 
                CDC, and HUD. We provide confidence indicators and full source citations 
                so you can verify the data yourself. Remember: these are indicators to 
                inform your decision, not guarantees of your personal experience.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my Premium subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your Premium subscription at any time through your 
                account settings. You'll continue to have Premium access until the end 
                of your billing period, then automatically return to the Free plan.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do you protect my privacy and sensitive information?
              </h3>
              <p className="text-gray-600">
                We store minimal profile data and never log personally identifiable information. 
                You can use TruePlace anonymously, and we mask IP addresses in analytics. 
                Your identity preferences are used only for scoring calculations and are never shared.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What areas does TruePlace cover?
              </h3>
              <p className="text-gray-600">
                We currently cover all U.S. states and counties with official government data. 
                Premium subscribers get neighborhood-level data for the 10 largest metropolitan areas, 
                with more cities being added regularly.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to find where you truly belong?
          </h2>
          <SignUpButton mode="modal">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
              Start Your Free Analysis
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}