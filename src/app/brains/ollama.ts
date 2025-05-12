"use server";
import ollama, { ChatResponse } from "ollama";

export async function chat(content: { role: string; content: string; }[], model: string): Promise<ChatResponse> {
  return await ollama.chat({
    model,
    messages: content,
  });
}

export async function fetchModelList() {
  return ollama.list();
}
