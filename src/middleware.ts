import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/onboarding(.*)',
  '/account(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Run middleware on all paths except static assets and Next internals
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}