"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

type ConvexClientProviderProps = {
  children: ReactNode;
};

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const convex = useMemo(() => {
    try {
      if (!convexUrl) return null;
      // Validate absolute URL
      // eslint-disable-next-line no-new
      new URL(convexUrl);
      return new ConvexReactClient(convexUrl);
    } catch {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.warn("Invalid NEXT_PUBLIC_CONVEX_URL; skipping Convex provider");
      }
      return null;
    }
  }, [convexUrl]);

  if (!convex) {
    // Provide Clerk even when Convex URL is not configured
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClientProvider;


