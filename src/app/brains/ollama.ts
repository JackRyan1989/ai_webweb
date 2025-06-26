"use server";
import ollama, { ChatResponse } from "ollama";
import type { ListResponse } from "ollama";

export interface ErrorObj {
  errStatus: string,
  message: string,
}

export async function chat(content: { role: string; content: string; }[], model: string): Promise<ChatResponse> {
  return await ollama.chat({
    model,
    messages: content,
  });
}

export async function fetchModelList(): Promise<ListResponse | ErrorObj> {
  try {
    return ollama.list();
  } catch {
    return {errStatus: 'error', message: 'Ollama is not running!'}
  }
}
