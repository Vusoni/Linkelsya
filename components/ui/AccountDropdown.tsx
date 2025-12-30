"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export function AccountDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Get initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "?";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-sans font-medium">
          {getInitials()}
        </div>
        
        {/* User info (hidden on mobile) */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-sans font-medium text-foreground leading-tight">
            {user?.name || "User"}
          </p>
          <p className="text-xs font-sans text-gray-500 leading-tight">
            {user?.email}
          </p>
        </div>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border/50 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info header (visible in dropdown for mobile) */}
          <div className="sm:hidden px-4 py-3 border-b border-border/50">
            <p className="text-sm font-sans font-medium text-foreground">
              {user?.name || "User"}
            </p>
            <p className="text-xs font-sans text-gray-500">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-sans text-foreground hover:bg-muted transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Profile Settings
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 my-1"></div>

          {/* Sign out */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-sans text-red-600 hover:bg-red-50 transition-colors duration-150"
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
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
