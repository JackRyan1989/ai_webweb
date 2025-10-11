// Tool Definition:
export const conductWebSearchTool = {
    type: 'function',
    function: {
        name: 'getHtmlRes',
        description: "Search for resources on the internet for a specific topic.",
        parameters: {
            type: 'object',
            required: ['query'],
            properties: {
                query: { type: "string", description: "The term to search for" }
            }
        }
    }
}
