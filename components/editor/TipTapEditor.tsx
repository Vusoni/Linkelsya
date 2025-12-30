"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface TipTapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export interface TipTapEditorRef {
  insertText: (text: string) => void;
}

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  function TipTapEditor({ content, onContentChange }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder: "Start writing your document...",
        }),
        Typography,
        CharacterCount,
      ],
      content: content ? (() => { try { return JSON.parse(content); } catch { return undefined; } })() : undefined,
      onUpdate: ({ editor }) => {
        const json = JSON.stringify(editor.getJSON());
        onContentChange(json);
      },
      editorProps: {
        attributes: {
          class: "prose prose-lg max-w-none focus:outline-none min-h-full p-8",
        },
      },
    });

    // Expose insertText method
    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        if (editor) {
          editor.chain().focus().insertContent(text).run();
        }
      },
    }), [editor]);

    // Update editor content when prop changes (initial load)
    useEffect(() => {
      if (editor && content && !editor.getText()) {
        try {
          const parsed = JSON.parse(content);
          editor.commands.setContent(parsed);
        } catch {
          // If content is not valid JSON, ignore
        }
      }
    }, [editor, content]);

    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <EditorToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
        {editor && (
          <div className="px-4 py-2 border-t border-border text-xs text-gray-400 font-sans">
            {editor.storage.characterCount.characters()} characters · {editor.storage.characterCount.words()} words
          </div>
        )}
      </div>
    );
  }
);
