'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = { firstName: 'Demo' }; // Mock user for development

  const navigation = [
    { name: 'Quick Look', href: '/app/quick', icon: '🎯' },
    { name: 'Deep Dive', href: '/app/deep', icon: '📊', premium: true },
    { name: 'Saved Places', href: '/app/saved', icon: '💾', premium: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                TruePlace
              </Link>
              
              <div className="hidden md:flex gap-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                    {item.premium && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upgrade
              </Link>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0] || 'D'}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <div className="flex gap-4 overflow-x-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                  {item.premium && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                      PRO
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {children}
      </main>
    </div>
  );
}