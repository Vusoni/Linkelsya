"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Handle missing environment variable gracefully during build
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

let convex: ConvexReactClient | null = null;

if (convexUrl) {
  convex = new ConvexReactClient(convexUrl);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // During build or if no Convex URL is configured, show a placeholder
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-gray-500 font-sans mb-2">Convex not configured</p>
          <p className="text-sm text-gray-400 font-sans">
            Run <code className="bg-muted px-2 py-1 rounded">npx convex dev</code> to set up
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
