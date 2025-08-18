"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function AccountPage() {
  const { isSignedIn, user } = useUser();
  return (
    <div className="mx-auto max-w-3xl py-10 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Account</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      {isSignedIn ? (
        <div className="text-sm text-muted-foreground">
          Signed in as {user?.primaryEmailAddress?.emailAddress}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Not signed in.</div>
      )}
    </div>
  );
}


