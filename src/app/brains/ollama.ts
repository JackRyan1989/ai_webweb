"use server";
import ollama, { ChatResponse } from "ollama";
import type { ListResponse } from "ollama";

export interface PayloadObj {
  status: string,
  payload: string | ListResponse,
}

export async function chat(content: { role: string; content: string; }[], model: string): Promise<ChatResponse> {
  return await ollama.chat({
    model,
    messages: content,
  });
}

export async function fetchModelList(): Promise<PayloadObj> {
  try {
    const payload = await ollama.list();
    return {status: 'success', payload};
  } catch {
    return {status: 'error', payload: 'Ollama is not running!'}
  }
}
