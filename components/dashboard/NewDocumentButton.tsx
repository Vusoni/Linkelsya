"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

export function NewDocumentButton() {
  const [isLoading, setIsLoading] = useState(false);
  const createDocument = useMutation(api.documents.create);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const documentId = await createDocument({
        userId: user._id,
      });
      router.push(`/editor/${documentId}`);
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCreate} isLoading={isLoading} size="lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      New Document
    </Button>
  );
}
