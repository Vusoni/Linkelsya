"use client";

import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { ChatMessage } from "./ChatMessage";
import { AISettingsModal } from "./AISettingsModal";
import { Knowledge } from "@/lib/types";

// Helper to get/set instructions from localStorage
const INSTRUCTIONS_KEY_PREFIX = "linkelsya_ai_instructions_";

function getStoredInstructions(documentId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(INSTRUCTIONS_KEY_PREFIX + documentId) || "";
}

function setStoredInstructions(documentId: string, instructions: string) {
  if (typeof window === "undefined") return;
  if (instructions) {
    localStorage.setItem(INSTRUCTIONS_KEY_PREFIX + documentId, instructions);
  } else {
    localStorage.removeItem(INSTRUCTIONS_KEY_PREFIX + documentId);
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatSidebarProps {
  documentId: Id<"documents">;
  documentContent: string;
  onInsertText: (text: string) => void;
  selectedContext?: string;
  onClearContext?: () => void;
}

export function AIChatSidebar({ documentId, documentContent, onInsertText, selectedContext, onClearContext }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemInstructions, setSystemInstructions] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load instructions from localStorage on mount
  useEffect(() => {
    const stored = getStoredInstructions(documentId);
    setSystemInstructions(stored);
  }, [documentId]);

  const handleSaveInstructions = (instructions: string) => {
    setSystemInstructions(instructions);
    setStoredInstructions(documentId, instructions);
  };

  const generateText = useAction(api.ai.generateText);
  const knowledge = useQuery(api.knowledge.listByDocument, { documentId });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when context is added
  useEffect(() => {
    if (selectedContext) {
      inputRef.current?.focus();
    }
  }, [selectedContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Build the prompt with context if available
    const promptContent = selectedContext
      ? `[Regarding this selected text: "${selectedContext}"]\n\n${input.trim()}`
      : input.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: selectedContext
        ? `📝 "${selectedContext.length > 100 ? selectedContext.slice(0, 100) + "..." : selectedContext}"\n\n${input.trim()}`
        : input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (onClearContext) onClearContext();
    setIsLoading(true);

    try {
      const knowledgeContext = (knowledge as Knowledge[] | undefined)?.map((k) => ({
        title: k.title,
        content: k.content,
      })) || [];

      const result = await generateText({
        prompt: promptContent,
        documentContent: documentContent,
        knowledgeContext,
        mode: "chat",
        systemInstructions: systemInstructions || undefined,
      });

      if (result.success && result.text) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("AI error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastAIMessageIndex = messages.map((m, i) => ({ role: m.role, index: i }))
    .filter((m) => m.role === "assistant")
    .pop()?.index;

  return (
    <aside className="w-80 bg-muted border-l border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <h2 className="font-sans font-semibold text-foreground">AI Assistant</h2>
          </div>
          
          {/* Settings button */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className={`p-1.5 rounded-md transition-colors ${
              systemInstructions 
                ? "text-primary bg-primary/10 hover:bg-primary/20" 
                : "text-gray-400 hover:text-foreground hover:bg-muted"
            }`}
            title={systemInstructions ? "Custom instructions active" : "AI settings"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
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
          </button>
        </div>
        <p className="text-xs text-gray-500 font-sans">
          {systemInstructions 
            ? "Custom writing instructions active" 
            : "Ask me to write, edit, or help with your document"
          }
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-sans mb-4">
              Start a conversation
            </p>
            <div className="space-y-2">
              {[
                "Write an introduction paragraph",
                "Help me summarize this section",
                "Suggest improvements for clarity",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left text-xs font-sans text-gray-600 bg-white border border-border rounded-lg px-3 py-2 hover:border-primary/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              onInsert={onInsertText}
              isLatestAI={index === lastAIMessageIndex}
            />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs font-sans">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-white">
        {/* Selected context indicator */}
        {selectedContext && (
          <div className="mb-3 p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-primary shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs font-sans font-medium text-primary mb-0.5">
                    Selected text context
                  </p>
                  <p className="text-xs font-sans text-gray-600 line-clamp-2">
                    "{selectedContext.length > 80 ? selectedContext.slice(0, 80) + "..." : selectedContext}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearContext}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                title="Remove context"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
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
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedContext ? "Ask about this text..." : "Ask the AI..."}
            className="flex-1 px-3 py-2 text-sm font-sans border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </form>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        documentId={documentId}
        initialInstructions={systemInstructions}
        onSave={handleSaveInstructions}
      />
    </aside>
  );
}
