"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-1.5 mb-8 bg-primary/5 border border-primary/10 rounded-full">
          <span className="text-sm font-sans text-primary">AI-Powered Writing Assistant</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
          Write with clarity.
          <br />
          <span className="text-primary">Reference with ease.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-600 font-serif max-w-2xl mx-auto mb-10 leading-relaxed">
          A thoughtful document editor that lets you bring your knowledge together, 
          with AI that helps you write—informed by everything you reference.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth">
            <Button size="lg" className="min-w-[180px]">
              Start Writing
              <svg
                className="ml-2 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="min-w-[180px]">
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Visual hint */}
        <div className="mt-20">
          <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-medium border border-border/50 overflow-hidden">
            <div className="h-8 bg-muted flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-300"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
              <div className="w-3 h-3 rounded-full bg-green-300"></div>
              <span className="ml-4 text-xs font-sans text-gray-400">Untitled Document</span>
            </div>
            <div className="p-8 text-left">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-4"></div>
              <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
              <div className="h-4 bg-primary/20 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
