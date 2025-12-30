"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { KnowledgeItem } from "./KnowledgeItem";
import { Knowledge } from "@/lib/types";

interface KnowledgeSidebarProps {
  documentId: Id<"documents">;
}

export function KnowledgeSidebar({ documentId }: KnowledgeSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const knowledge = useQuery(api.knowledge.listByDocument, { documentId });
  const createKnowledge = useMutation(api.knowledge.create);
  const deleteKnowledge = useMutation(api.knowledge.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createKnowledge({
        documentId,
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add knowledge:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (knowledgeId: Id<"knowledge">) => {
    await deleteKnowledge({ knowledgeId });
  };

  return (
    <aside className="w-72 bg-muted border-r border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-sans font-semibold text-foreground">Knowledge</h2>
          <span className="text-xs text-gray-400 font-sans">
            {knowledge?.length || 0} items
          </span>
        </div>
        <p className="text-xs text-gray-500 font-sans">
          Add reference materials for AI context
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {knowledge === undefined ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : knowledge.length === 0 ? (
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
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-sans">
              No knowledge added yet
            </p>
          </div>
        ) : (
          (knowledge as Knowledge[]).map((item) => (
            <KnowledgeItem
              key={item._id}
              id={item._id}
              title={item.title}
              content={item.content}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add button */}
      <div className="p-4 border-t border-border bg-white">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setIsModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Knowledge
        </Button>
      </div>

      {/* Add Knowledge Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Knowledge"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="knowledge-title"
            label="Title"
            placeholder="e.g., Research Notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            id="knowledge-content"
            label="Content"
            placeholder="Paste your reference material here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
            >
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}
