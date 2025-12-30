import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Scribe - AI Document Editor",
  description: "Write smarter with AI-powered document editing and knowledge context",
};

// Force dynamic rendering to avoid static generation issues with Convex
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
