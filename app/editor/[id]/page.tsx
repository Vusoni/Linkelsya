"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRequireSubscription } from "@/components/providers/AuthProvider";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { TipTapEditor, TipTapEditorRef } from "@/components/editor/TipTapEditor";
import { KnowledgeSidebar } from "@/components/editor/KnowledgeSidebar";
import { AIChatSidebar } from "@/components/editor/AIChatSidebar";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as Id<"documents">;
  
  const { user, isLoading: authLoading, isSubscribed } = useRequireSubscription();
  const document = useQuery(api.documents.get, { documentId });
  const updateDocument = useMutation(api.documents.update);

  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<number | undefined>();
  const [selectedContext, setSelectedContext] = useState<string | undefined>();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<TipTapEditorRef>(null);

  // Initialize content from document
  useEffect(() => {
    if (document) {
      setContent(document.content);
      setLastSaved(document.updatedAt);
    }
  }, [document]);

  // Auto-save with debounce
  const saveDocument = useCallback(async (newContent: string) => {
    if (!documentId) return;
    
    setSaveStatus("saving");
    try {
      await updateDocument({
        documentId,
        content: newContent,
      });
      setSaveStatus("saved");
      setLastSaved(Date.now());
    } catch (error) {
      console.error("Failed to save:", error);
      setSaveStatus("unsaved");
    }
  }, [documentId, updateDocument]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setSaveStatus("unsaved");

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(newContent);
    }, 2000);
  }, [saveDocument]);

  const handleTitleChange = async (newTitle: string) => {
    if (!documentId) return;
    
    setSaveStatus("saving");
    try {
      await updateDocument({
        documentId,
        title: newTitle,
      });
      setSaveStatus("saved");
      setLastSaved(Date.now());
    } catch (error) {
      console.error("Failed to save title:", error);
      setSaveStatus("unsaved");
    }
  };

  const handleInsertText = (text: string) => {
    if (editorRef.current) {
      editorRef.current.insertText(text);
    }
  };

  const handleAddToContext = (text: string) => {
    setSelectedContext(text);
  };

  const handleClearContext = () => {
    setSelectedContext(undefined);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (authLoading || document === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gray-400 font-sans">Loading document...</div>
      </div>
    );
  }

  if (!user || !isSubscribed) {
    return null;
  }

  if (document === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Document not found</h1>
        <p className="text-gray-500 font-sans mb-6">This document may have been deleted or doesn&apos;t exist.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-primary hover:underline font-sans"
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-background">
      <EditorHeader
        documentId={documentId}
        title={document.title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <KnowledgeSidebar documentId={documentId} />
        
        <main className="flex-1 flex flex-col min-w-0">
          <TipTapEditor
            ref={editorRef}
            content={content}
            onContentChange={handleContentChange}
            onAddToContext={handleAddToContext}
          />
        </main>
        
        <AIChatSidebar
          documentId={documentId}
          documentContent={content}
          onInsertText={handleInsertText}
          selectedContext={selectedContext}
          onClearContext={handleClearContext}
        />
      </div>
    </div>
  );
}
