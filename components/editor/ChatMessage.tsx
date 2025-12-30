"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onInsert?: (text: string) => void;
  isLatestAI?: boolean;
}

export function ChatMessage({ role, content, onInsert, isLatestAI }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex flex-col gap-2", isUser && "items-end")}>
      <div
        className={cn(
          "max-w-[90%] rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-white"
            : "bg-white border border-border"
        )}
      >
        <p className={cn(
          "text-sm font-sans whitespace-pre-wrap",
          isUser ? "text-white" : "text-foreground"
        )}>
          {content}
        </p>
      </div>

      {!isUser && onInsert && isLatestAI && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onInsert(content)}
            className="text-xs font-sans text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Insert at cursor
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-xs font-sans text-gray-400 hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
