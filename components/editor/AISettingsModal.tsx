"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  initialInstructions: string;
  onSave: (instructions: string) => void;
}

const EXAMPLE_INSTRUCTIONS = [
  {
    title: "Professional Tone",
    text: "Write in a professional, formal tone. Avoid colloquialisms and casual language. Use industry-standard terminology.",
  },
  {
    title: "Casual & Friendly",
    text: "Write in a conversational, friendly tone. Use simple language and contractions. Be approachable and warm.",
  },
  {
    title: "Academic Writing",
    text: "Write in academic style with proper citations format. Be precise and objective. Avoid first-person pronouns.",
  },
  {
    title: "Creative & Engaging",
    text: "Write with creativity and flair. Use vivid descriptions, metaphors, and engaging narratives. Make the content memorable.",
  },
];

export function AISettingsModal({
  isOpen,
  onClose,
  initialInstructions,
  onSave,
}: AISettingsModalProps) {
  const [instructions, setInstructions] = useState(initialInstructions);

  // Sync with initial value when modal opens
  useEffect(() => {
    if (isOpen) {
      setInstructions(initialInstructions);
    }
  }, [isOpen, initialInstructions]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(instructions);
    onClose();
  };

  const handleUseExample = (text: string) => {
    setInstructions(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold text-foreground">
                  AI Writing Settings
                </h2>
                <p className="text-xs text-gray-500 font-sans">
                  Customize how the AI writes for this document
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Instructions textarea */}
          <div className="mb-4">
            <label className="block text-sm font-sans font-medium text-foreground mb-2">
              Custom Instructions
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g., Write in a formal academic tone. Avoid using contractions. Use British English spelling."
              className="min-h-[120px] resize-none"
            />
            <p className="mt-1.5 text-xs text-gray-500 font-sans">
              These instructions will guide the AI&apos;s writing style, tone, and approach for this document.
            </p>
          </div>

          {/* Example templates */}
          <div>
            <p className="text-sm font-sans font-medium text-foreground mb-2">
              Quick Templates
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLE_INSTRUCTIONS.map((example) => (
                <button
                  key={example.title}
                  type="button"
                  onClick={() => handleUseExample(example.text)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-sans font-medium text-foreground mb-1">
                    {example.title}
                  </p>
                  <p className="text-xs text-gray-500 font-sans line-clamp-2">
                    {example.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setInstructions("")}
            className="text-sm font-sans text-gray-500 hover:text-foreground transition-colors"
          >
            Clear instructions
          </button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
