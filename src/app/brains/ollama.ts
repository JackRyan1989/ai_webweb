"use server";
import ollama, { ChatResponse, Tool } from "ollama";
import type { ListResponse } from "ollama";
import type webSearchSchema from "./schemas"

export interface PayloadObj {
  status: string;
  payload: string | ListResponse;
}

export interface ChatProps {
  messages: { role: string; content: string }[];
  model: string;
  tools?: Tool[];
  format?: typeof webSearchSchema
}

export async function chat(
  props: ChatProps,
): Promise<ChatResponse> {
  return await ollama.chat({
    ...props,
  });
}

export async function fetchModelList(): Promise<PayloadObj> {
  try {
    const payload = await ollama.list();
    return { status: "success", payload };
  } catch {
    return { status: "error", payload: "Ollama is not running!" };
  }
}
