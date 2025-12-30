"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Trial } from "@/components/subscribe/Trial";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const benefits = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    title: "AI Writing Partner",
    description: "Get intelligent suggestions, drafts, and edits powered by advanced AI",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: "Knowledge Context",
    description: "Add reference materials and the AI uses them for relevant suggestions",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Unlimited Documents",
    description: "Create and manage as many documents as you need",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Secure & Private",
    description: "Your documents and data are encrypted and protected",
  },
];

export default function SubscribePage() {
  const { user, isLoading, isSubscribed, refreshSubscription } = useAuth();
  const router = useRouter();
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const activateSubscription = useMutation(api.auth.debugActivateSubscription);
  const [isActivating, setIsActivating] = useState(false);

  // Initialize Polar checkout embed
  useEffect(() => {
    PolarEmbedCheckout.init();
  }, []);

  // Redirect if already subscribed
  useEffect(() => {
    if (!isLoading && user && isSubscribed) {
      router.push("/dashboard");
    }
  }, [isLoading, user, isSubscribed, router]);

  // Manual activation handler (for when webhook fails)
  const handleManualActivation = async () => {
    if (!user?.email) return;
    
    setIsActivating(true);
    try {
      await activateSubscription({ email: user.email });
      refreshSubscription();
      // Wait a moment for the query to update
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Failed to activate subscription:", error);
      alert("Failed to activate subscription. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  // Poll for subscription status after checkout
  const pollForSubscription = useCallback(() => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 30; // Poll for up to 30 seconds
    
    const poll = setInterval(() => {
      attempts++;
      refreshSubscription();
      
      if (isSubscribed || attempts >= maxAttempts) {
        clearInterval(poll);
        setIsPolling(false);
        if (isSubscribed) {
          router.push("/dashboard");
        }
      }
    }, 1000);

    return () => clearInterval(poll);
  }, [refreshSubscription, isSubscribed, router]);

  // Listen for successful checkout
  useEffect(() => {
    const handleCheckoutSuccess = () => {
      setCheckoutComplete(true);
      pollForSubscription();
    };

    const handleCheckoutClose = () => {
      // If checkout was completed, start polling
      if (checkoutComplete) {
        pollForSubscription();
      }
    };

    window.addEventListener("polar:checkout:success", handleCheckoutSuccess);
    window.addEventListener("polar:checkout:close", handleCheckoutClose);
    
    return () => {
      window.removeEventListener("polar:checkout:success", handleCheckoutSuccess);
      window.removeEventListener("polar:checkout:close", handleCheckoutClose);
    };
  }, [checkoutComplete, pollForSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gray-400 font-sans">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  // Show polling state after checkout
  if (isPolling || checkoutComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
            Activating your subscription...
          </h2>
          <p className="text-gray-500 font-sans">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  // Build checkout URL with user email and success URL
  // Using Polar sandbox for testing (payments are not processed)
  const baseCheckoutUrl = "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_mZnadErv62dwmlgWSX2PDT8VdTsVUZWsn996f1UZC1u/redirect";
  const successUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/dashboard?checkout=success` 
    : "/dashboard?checkout=success";
  
  const checkoutUrl = user?.email 
    ? `${baseCheckoutUrl}?customer_email=${encodeURIComponent(user.email)}&success_url=${encodeURIComponent(successUrl)}`
    : baseCheckoutUrl;

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
          <span className="font-serif font-bold text-xl text-foreground">Inkwell</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-sans font-medium mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start with a free trial
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Unlock the full power of<br />AI-assisted writing
          </h1>
          <p className="text-lg text-gray-600 font-serif max-w-2xl mx-auto">
            Join thousands of writers who use Inkwell to write faster, better, and with more clarity.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-white rounded-2xl shadow-soft border border-border/50 overflow-hidden max-w-md mx-auto mb-12">
          {/* Card header */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-8 text-white text-center">
            <h2 className="text-xl font-serif font-semibold mb-2">Inkwell Pro</h2>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-serif font-bold">$19</span>
              <span className="text-white/80 font-sans">/month</span>
            </div>
            <p className="text-white/80 text-sm font-sans mt-2">
              Cancel anytime
            </p>
          </div>

          {/* Benefits list */}
          <div className="p-8">
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-gray-500 font-sans">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA Button - Polar Embed Checkout */}
            <a
              href={checkoutUrl}
              data-polar-checkout
              data-polar-checkout-theme="light"
              className="block w-full"
            >
              <Button size="lg" className="w-full text-lg py-4">
                Start free trial
              </Button>
            </a>

            <p className="text-center text-sm text-gray-500 font-sans mt-4">
              No credit card required to start
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2 font-sans text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Secure payments
          </div>
          <div className="flex items-center gap-2 font-sans text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cancel anytime
          </div>
          <div className="flex items-center gap-2 font-sans text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Loved by writers
          </div>
        </div>

        {/* Wrong account logout link */}
        <Trial />

        {/* Manual activation button (for when webhook fails) */}
        {user && !isSubscribed && (
          <div className="text-center mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-yellow-800 font-sans mb-4">
              Already have a subscription? Click below to sync your account.
            </p>
            <Button
              onClick={handleManualActivation}
              isLoading={isActivating}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isActivating ? "Activating..." : "Activate My Subscription"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
