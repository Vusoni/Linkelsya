"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NewDocumentButton } from "@/components/dashboard/NewDocumentButton";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Document } from "@/lib/types";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  
  const documents = useQuery(
    api.documents.listByUser,
    user ? { userId: user._id } : "skip"
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gray-400 font-sans">Loading...</div>
      </div>
    );
  }

  if (!user) {
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
