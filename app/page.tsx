import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
