"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, truncateText } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DocumentCardProps {
  id: Id<"documents">;
  title: string;
  content: string;
  updatedAt: number;
}

export function DocumentCard({ id, title, content, updatedAt }: DocumentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDocument = useMutation(api.documents.remove);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument({ documentId: id });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete document:", error);
      setIsDeleting(false);
    }
  };

  const displayTitle = title || "Untitled Document";

  return (
    <>
      <Link href={`/editor/${id}`}>
        <div className="relative bg-white rounded-lg shadow-soft border border-border/50 p-6 hover:shadow-medium transition-all duration-200 cursor-pointer group">
          {/* Delete button - appears on hover */}
          <button
            onClick={handleDeleteClick}
            className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200 shadow-sm border border-border/50"
            title="Delete document"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          <h3 className="text-lg font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors pr-8">
            {displayTitle}
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${displayTitle}"? This will also remove all associated knowledge items. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
