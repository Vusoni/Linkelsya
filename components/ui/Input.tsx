"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-sans font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-2.5 font-sans text-foreground bg-white border border-border rounded-sm",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-all duration-200",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
