'use server'

const webSearchTool = {
    type: 'function',
    function: {
        name: 'webSearch',
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

export const availableTools = {webSearchTool: webSearchTool};

export default webSearchTool;
