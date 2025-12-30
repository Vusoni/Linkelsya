"use client";

import Link from "next/link";
import { formatDate, truncateText } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface DocumentCardProps {
  id: Id<"documents">;
  title: string;
  content: string;
  updatedAt: number;
}

export function DocumentCard({ id, title, content, updatedAt }: DocumentCardProps) {
  // Extract plain text from TipTap JSON content
  const getPreviewText = (jsonContent: string): string => {
    if (!jsonContent) return "No content yet...";
    
    try {
      const parsed = JSON.parse(jsonContent);
      const extractText = (node: { type?: string; text?: string; content?: unknown[] }): string => {
        if (node.text) return node.text;
        if (node.content) {
          return node.content.map((child) => extractText(child as { type?: string; text?: string; content?: unknown[] })).join(" ");
        }
        return "";
      };
      const text = extractText(parsed);
      return text || "No content yet...";
    } catch {
      // If not valid JSON, it might be plain text
      return content || "No content yet...";
    }
  };

  return (
    <Link href={`/editor/${id}`}>
      <div className="bg-white rounded-lg shadow-soft border border-border/50 p-6 hover:shadow-medium transition-all duration-200 cursor-pointer group">
        <h3 className="text-lg font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title || "Untitled Document"}
        </h3>
        <p className="text-sm text-gray-500 font-serif leading-relaxed mb-4">
          {truncateText(getPreviewText(content), 120)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-sans">
            Updated {formatDate(updatedAt)}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
