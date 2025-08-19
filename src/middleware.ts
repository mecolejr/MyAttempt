import { NextRequest, NextResponse } from 'next/server'

// Simple pass-through middleware for development
export default function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip middleware for static assets and Next internals
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}