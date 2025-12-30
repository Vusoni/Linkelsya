"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface TipTapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onAddToContext?: (text: string) => void;
}

export interface TipTapEditorRef {
  insertText: (text: string) => void;
  getSelectedText: () => string;
}

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  function TipTapEditor({ content, onContentChange, onAddToContext }, ref) {
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
        Highlight.configure({
          multicolor: true,
        }),
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

    // Expose editor methods
    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        if (editor) {
          editor.chain().focus().insertContent(text).run();
        }
      },
      getSelectedText: () => {
        if (editor) {
          const { from, to } = editor.state.selection;
          return editor.state.doc.textBetween(from, to, " ");
        }
        return "";
      },
    }), [editor]);

    const handleAddToContext = () => {
      if (editor && onAddToContext) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        if (selectedText.trim()) {
          onAddToContext(selectedText.trim());
        }
      }
    };

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
          
          {/* Bubble menu for adding text to AI context */}
          {editor && onAddToContext && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ 
                duration: 150,
                placement: "top",
              }}
              className="bg-foreground text-white rounded-lg shadow-lg px-1 py-1 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                type="button"
                onClick={handleAddToContext}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-sans font-medium rounded-md hover:bg-white/10 transition-colors"
                title="Add selected text to AI chat context"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Add to Chat
              </button>
            </BubbleMenu>
          )}
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
