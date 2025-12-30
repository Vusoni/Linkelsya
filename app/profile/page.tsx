"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth, useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { updateProfile } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await updateProfile({
        name: name || undefined,
        email: email || undefined,
      });
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "?";
  };

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
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Back button and Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-500 hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              <span className="text-sm font-sans">Back to Dashboard</span>
            </Link>
          </div>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
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

          {/* Spacer */}
          <div className="w-[140px]"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-500 font-serif">
            Manage your account information
          </p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-xl shadow-soft border border-border/50 overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 px-8 py-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-sans font-semibold shadow-lg">
              {getInitials()}
            </div>
            <p className="mt-4 text-lg font-serif font-medium text-foreground">
              {name || "Set your name"}
            </p>
            <p className="text-sm font-sans text-gray-500">{email}</p>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Success message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-sans text-green-800">{successMessage}</span>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm font-sans text-red-800">{errorMessage}</span>
              </div>
            )}

            {/* Name field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-sans font-medium text-foreground mb-2"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
              <p className="mt-1.5 text-xs font-sans text-gray-500">
                This is how your name will appear across the app
              </p>
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-sans font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
              <p className="mt-1.5 text-xs font-sans text-gray-500">
                Used for signing in and notifications
              </p>
            </div>

            {/* Submit button */}
            <div className="pt-4 flex items-center gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Account info */}
        <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border/30">
          <h3 className="text-sm font-sans font-medium text-foreground mb-3">
            Account Information
          </h3>
          <div className="space-y-2 text-sm font-sans text-gray-500">
            <p>
              <span className="text-gray-400">Account ID:</span>{" "}
              <span className="font-mono text-xs">{user._id}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
