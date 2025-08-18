import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">TruePlace</div>
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
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Where You'll{" "}
            <span className="text-blue-600">Truly Belong</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get your personalized <strong>TruePlace Score</strong> – a data-driven 
            compatibility rating that tells you if you'll feel safe, welcome, and at home 
            in any location across America.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">Start Your Analysis</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app/quick" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">Go to Quick Look</Link>
            </SignedIn>
            <Link 
              href="/demo" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              See Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Safety First</h3>
            <p className="text-gray-600">
              Crime data from FBI, hate crime statistics, and community safety metrics 
              tailored to your identity and concerns.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">True Community</h3>
            <p className="text-gray-600">
              Diversity metrics, representation data, and inclusion indicators so you 
              can find your people and feel genuinely welcomed.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart & Transparent</h3>
            <p className="text-gray-600">
              Every score shows its sources – FBI, Census, CDC data with full citations. 
              No black boxes, just facts you can verify.
            </p>
          </div>
        </div>

        {/* Quick Look Demo */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            See Your TruePlace Score
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Look</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Seattle, WA</span>
                    <span className="text-2xl font-bold text-green-600">87%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    High diversity, excellent safety record, strong LGBTQ+ protections
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Austin, TX</span>
                    <span className="text-2xl font-bold text-blue-600">73%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Growing tech scene, moderate cost of living, cultural opportunities
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How We Calculate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safety (FBI Crime Data)</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community (Census)</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost & Quality (HUD/CDC)</span>
                    <span className="font-medium">20%</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  "Indicators, not guarantees; individual experiences vary."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Free, Upgrade When Ready
          </h2>
          <p className="text-gray-600 mb-8">
            Free yearly data snapshots. Premium unlocks monthly updates, 
            neighborhood zoom, and trend alerts.
          </p>
          <Link 
            href="/pricing"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Pricing
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="text-gray-600 text-sm">
            © 2024 TruePlace. Built with government data from FBI, Census, CDC, and HUD.
          </div>
        </div>
      </footer>
    </div>
  );
}
