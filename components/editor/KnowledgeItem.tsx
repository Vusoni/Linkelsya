"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface KnowledgeItemProps {
  id: Id<"knowledge">;
  title: string;
  content: string;
  onDelete: (id: Id<"knowledge">) => void;
}

export function KnowledgeItem({ id, title, content, onDelete }: KnowledgeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
      setShowDeleteConfirm(false);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={cn(
        "bg-white border border-border rounded-lg overflow-hidden transition-all",
        isDeleting && "opacity-50"
      )}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
        >
          <span className="font-sans font-medium text-sm text-foreground truncate pr-2">
            {title}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform shrink-0",
              isExpanded && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-3 border-t border-border/50">
            <p className="text-sm text-gray-600 font-sans whitespace-pre-wrap pt-3 max-h-40 overflow-y-auto">
              {content}
            </p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-xs text-red-500 hover:text-red-600 font-sans transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Remove Knowledge Item"
        message={`Are you sure you want to remove "${title}"? This action cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
