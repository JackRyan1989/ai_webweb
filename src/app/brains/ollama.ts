"use server";
import ollama, { ChatResponse } from "ollama";

export async function chat(content: [], model: string): Promise<ChatResponse> {
  const response = await ollama.chat({
    model,
    messages: content,
  });
  return response;
}

export async function list() {
  return ollama.list();
}
