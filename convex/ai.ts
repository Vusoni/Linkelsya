"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const generateText = action({
  args: {
    prompt: v.string(),
    documentContent: v.string(),
    knowledgeContext: v.array(v.object({
      title: v.string(),
      content: v.string(),
    })),
    mode: v.union(v.literal("write"), v.literal("edit"), v.literal("chat")),
    systemInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create OpenAI client inside the handler so env vars are available
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { prompt, documentContent, knowledgeContext, mode, systemInstructions } = args;

    // Build knowledge context string
    const knowledgeStr = knowledgeContext.length > 0
      ? `\n\nReference Materials:\n${knowledgeContext
          .map((k, i) => `[${i + 1}] ${k.title}:\n${k.content}`)
          .join("\n\n")}`
      : "";

    // Build custom instructions string if provided
    const customInstructions = systemInstructions
      ? `\n\nIMPORTANT - User's Custom Writing Instructions (follow these carefully):\n${systemInstructions}\n`
      : "";

    // Build system prompt based on mode
    let systemPrompt = "";
    
    if (mode === "write") {
      systemPrompt = `You are an expert writing assistant helping to compose a document. 
Your task is to generate well-written, coherent text based on the user's request.
Use a professional yet approachable tone. Write in clear, concise prose.
${customInstructions}
Current document content:
"""
${documentContent || "(empty document)"}
"""
${knowledgeStr}

Based on the reference materials provided (if any) and the current document, help the user write new content.
Only output the text to be added - no explanations or meta-commentary.`;
    } else if (mode === "edit") {
      systemPrompt = `You are an expert editor helping to improve a document.
Your task is to edit and improve the text based on the user's request.
Maintain the original voice and style while making improvements.
${customInstructions}
Current document content:
"""
${documentContent || "(empty document)"}
"""
${knowledgeStr}

Based on the user's editing request, provide the revised text.
Only output the revised text - no explanations or meta-commentary.`;
    } else {
      systemPrompt = `You are a helpful writing assistant engaged in a conversation about a document.
Help the user with their writing by answering questions, providing suggestions, and offering guidance.
${customInstructions}
Current document content:
"""
${documentContent || "(empty document)"}
"""
${knowledgeStr}

Engage naturally with the user's questions and requests. If they ask you to write or edit something,
provide the text they can use. Be helpful and supportive.`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const generatedText = response.choices[0]?.message?.content || "";
      
      return {
        success: true,
        text: generatedText,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return {
        success: false,
        text: "",
        error: error instanceof Error ? error.message : "An error occurred while generating text",
      };
    }
  },
});

export const improveWriting = action({
  args: {
    text: v.string(),
    instruction: v.string(),
  },
  handler: async (ctx, args) => {
    // Create OpenAI client inside the handler so env vars are available
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { text, instruction } = args;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert editor. Improve the given text according to the user's instruction.
Only output the improved text - no explanations.`,
          },
          {
            role: "user",
            content: `Instruction: ${instruction}\n\nText to improve:\n"""${text}"""`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const improvedText = response.choices[0]?.message?.content || "";
      
      return {
        success: true,
        text: improvedText,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      return {
        success: false,
        text: "",
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  },
});
