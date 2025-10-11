"use server";
import ollama, { ChatResponse } from "ollama";
import type { ListResponse, Tool } from "ollama";

export interface ErrorObj {
  errStatus: string;
  message: string;
}

export async function chat(
  content: { role: string; content: string }[],
  model: string,
  tools?: Tool[],
): Promise<ChatResponse> {
  return await ollama.chat({
    model,
    messages: content,
    tools,
  });
}

export async function fetchModelList(): Promise<ListResponse | ErrorObj> {
  try {
    return ollama.list();
  } catch {
    return { errStatus: "error", message: "Ollama is not running!" };
  }
}
