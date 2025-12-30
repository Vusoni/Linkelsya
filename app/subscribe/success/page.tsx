"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function SubscribeSuccessPage() {
  const { user, isLoading, isSubscribed, refreshSubscription } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [showManualButton, setShowManualButton] = useState(false);

  // Poll for subscription status
  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push("/auth");
      return;
    }

    if (isSubscribed) {
      // Subscription confirmed, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    // Poll for subscription status
    const maxAttempts = 30; // 30 seconds
    const pollInterval = setInterval(() => {
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= maxAttempts) {
          clearInterval(pollInterval);
          setShowManualButton(true);
          return newAttempts;
        }
        refreshSubscription();
        return newAttempts;
      });
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [user, isLoading, isSubscribed, refreshSubscription, router]);

  // Redirect when subscription is confirmed
  useEffect(() => {
    if (isSubscribed) {
      router.push("/dashboard");
    }
  }, [isSubscribed, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gray-400 font-sans">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          <span className="font-serif font-bold text-xl text-foreground">Linkelsya</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        {!showManualButton ? (
          <>
            {/* Success animation */}
            <div className="w-20 h-20 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 font-sans mb-8">
              Thank you for subscribing to Linkelsya Pro. We&apos;re activating your account...
            </p>

            {/* Loading spinner */}
            <div className="flex items-center justify-center gap-3 text-gray-500">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-sans">Confirming subscription...</span>
            </div>
          </>
        ) : (
          <>
            {/* Manual continue */}
            <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
              Almost There!
            </h1>
            <p className="text-lg text-gray-600 font-sans mb-8">
              Your payment was successful. Click below to continue to your dashboard.
            </p>

            <Button
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="w-full max-w-xs mx-auto"
            >
              Continue to Dashboard
            </Button>

            <p className="text-sm text-gray-500 font-sans mt-4">
              If you don&apos;t see your subscription activated, please wait a few moments and refresh the page.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
