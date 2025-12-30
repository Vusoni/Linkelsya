"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  lastSaved?: number;
}

export function EditorHeader({ title, onTitleChange, saveStatus, lastSaved }: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-border px-4 flex items-center justify-between shrink-0">
      {/* Left: Back button and title */}
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-500 hover:text-foreground transition-colors shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-sans hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-6 w-px bg-border shrink-0" />

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-lg font-serif font-semibold text-foreground bg-transparent border-b-2 border-primary outline-none min-w-0 max-w-[300px]"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-lg font-serif font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[300px]"
            title="Click to edit title"
          >
            {title || "Untitled Document"}
          </button>
        )}
      </div>

      {/* Right: Save status */}
      <div className="flex items-center gap-2 text-sm font-sans text-gray-400 shrink-0">
        {saveStatus === "saving" && (
          <>
            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving...</span>
          </>
        )}
        {saveStatus === "saved" && lastSaved && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Saved {formatDate(lastSaved)}</span>
          </>
        )}
        {saveStatus === "unsaved" && (
          <span className="text-amber-500">Unsaved changes</span>
        )}
      </div>
    </header>
  );
}
