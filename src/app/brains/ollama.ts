"use server";
import ollama, { ChatResponse } from "ollama";
import type { ListResponse } from "ollama";

export interface PayloadObj {
  status: string;
  payload: string | ListResponse;
}

export interface ChatProps {
  messages: { role: string; content: string }[];
  model: string;
  tools?: [];
}

export async function chat(
  { messages, model, tools }: ChatProps,
): Promise<ChatResponse> {
  const args: ChatProps = { model: model, messages: messages };
  if (tools) {
    args["tools"] = tools;
  }
  return await ollama.chat({
    ...args,
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
