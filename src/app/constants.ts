export const modelAbilities = {
    "cogito:8b": {
        capabilites: ["completion", "tools"],
    },
    "granite3.1-moe:3b": {
        capabilites: ["completion", "tools"],
    },
    "smollm2:1.7b": {
        capabilites: ["completion", "tools"],
    },
    "qwen3:8b": {
        capabilites: ["completion"," thinking", "tools"],
    },
    "gemma3:4b": {
        capabilites: ["completion", "vision"],
    },
    "llama3.2:3b": {
        capabilites: ["completion", "tools"],
    },
    "gemma3:1b": {
        capabilites: ["completion"],
    },
};

export type modelList = "cogito:8b" | "granite3.1-moe:3b" | "smollm2:1.7b" | "qwen3:8b" | "gemma3:4b" | "llama3.2:3b" | "gemma3:1b"

export const webSearchTool = {
    type: 'function',
    function: {
        name: 'webSearchTool',
        description: 'Search the web and return results in structured output.',
        parameters: {
            type: 'object',
            required: ['query'],
            properties: {
                query: { type: 'string', description: 'The term or phrase to search for.' }
            },
        }
    }
};
