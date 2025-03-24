"use server";
import ollama, { ChatResponse } from "ollama";

export async function chat(data: FormData): Promise<string | ChatResponse> {
    const role = "user";
    const content = data.get('input')
    let model = data.get('selectedModel')
    if (typeof model !== "string") {
        model = "deepseek-r1:1.5b"
    }

    if (typeof content != "string") {
        return "How did you pass in something other than a string?"
    }

    if (content.trim() == "") {
        return "Type something in.";
    }

    const response = await ollama.chat({
        model,
        messages: [{ role, content }],
    });
    return response;
}

export async function list() {
    return ollama.list();
}
