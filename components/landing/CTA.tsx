"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-primary rounded-2xl px-8 py-16 md:px-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="16" cy="16" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Ready to write smarter?
            </h2>
            <p className="text-lg text-white/80 font-serif max-w-xl mx-auto mb-8">
              Join writers who use Scribe to create documents informed by their knowledge and enhanced by AI.
            </p>
            <Link href="/auth">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 min-w-[200px]"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
