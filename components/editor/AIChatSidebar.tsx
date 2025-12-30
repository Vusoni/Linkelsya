"use client";

import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { ChatMessage } from "./ChatMessage";
import { Knowledge } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatSidebarProps {
  documentId: Id<"documents">;
  documentContent: string;
  onInsertText: (text: string) => void;
}

export function AIChatSidebar({ documentId, documentContent, onInsertText }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateText = useAction(api.ai.generateText);
  const knowledge = useQuery(api.knowledge.listByDocument, { documentId });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const knowledgeContext = (knowledge as Knowledge[] | undefined)?.map((k) => ({
        title: k.title,
        content: k.content,
      })) || [];

      const result = await generateText({
        prompt: userMessage.content,
        documentContent: documentContent,
        knowledgeContext,
        mode: "chat",
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
        <div className="flex items-center gap-2 mb-2">
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
        <p className="text-xs text-gray-500 font-sans">
          Ask me to write, edit, or help with your document
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
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI..."
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
    </aside>
  );
}
