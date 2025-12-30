"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, useEffect } from "react";

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, children, ...props }, ref) => {
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

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          ref={ref}
          className={cn(
            "relative bg-white rounded-lg shadow-medium max-w-md w-full mx-4 p-6",
            "animate-in fade-in zoom-in-95 duration-200",
            className
          )}
          {...props}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Title */}
          {title && (
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              {title}
            </h2>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export { Modal };
