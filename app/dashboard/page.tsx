"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NewDocumentButton } from "@/components/dashboard/NewDocumentButton";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Document } from "@/lib/types";

export default function DashboardPage() {
  const { user, isLoading: authLoading, isSubscribed, refreshSubscription } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  
  const isPostCheckout = searchParams.get("checkout") === "success";
  
  const documents = useQuery(
    api.documents.listByUser,
    user ? { userId: user._id } : "skip"
  );

  // Handle post-checkout polling for subscription status
  useEffect(() => {
    if (!isPostCheckout || authLoading || !user) return;
    
    if (isSubscribed) {
      // Subscription confirmed, remove query param
      router.replace("/dashboard");
      return;
    }
    
    // Start polling for subscription
    setIsCheckingOut(true);
    const maxAttempts = 30; // Poll for up to 30 seconds
    
    const pollInterval = setInterval(() => {
      setPollAttempts((prev) => {
        const newAttempts = prev + 1;
        refreshSubscription();
        
        if (newAttempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsCheckingOut(false);
          // Redirect to subscribe page if subscription not confirmed
          router.push("/subscribe");
        }
        return newAttempts;
      });
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isPostCheckout, authLoading, user, isSubscribed, refreshSubscription, router]);

  // Redirect when subscription is confirmed during polling
  useEffect(() => {
    if (isPostCheckout && isSubscribed) {
      setIsCheckingOut(false);
      router.replace("/dashboard");
    }
  }, [isPostCheckout, isSubscribed, router]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  // Redirect to subscribe if not subscribed (and not in post-checkout flow)
  useEffect(() => {
    if (!authLoading && user && !isSubscribed && !isPostCheckout && !isCheckingOut) {
      router.push("/subscribe");
    }
  }, [authLoading, user, isSubscribed, isPostCheckout, isCheckingOut, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gray-400 font-sans">Loading...</div>
      </div>
    );
  }

  // Show activation screen during post-checkout polling
  if (isCheckingOut || (isPostCheckout && !isSubscribed)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-500 font-sans mb-4">
            Activating your subscription...
          </p>
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-sans text-sm">This will only take a moment</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isSubscribed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Your Documents
            </h1>
            <p className="text-gray-500 font-serif">
              {user.name ? `Welcome back, ${user.name}` : "Start writing something new"}
            </p>
          </div>
          <NewDocumentButton />
        </div>

        {/* Documents grid */}
        {documents === undefined ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-soft border border-border/50 p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
              No documents yet
            </h2>
            <p className="text-gray-500 font-serif mb-6">
              Create your first document to get started
            </p>
            <NewDocumentButton />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(documents as Document[]).map((doc) => (
              <DocumentCard
                key={doc._id}
                id={doc._id}
                title={doc.title}
                content={doc.content}
                updatedAt={doc.updatedAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
