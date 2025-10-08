import search from '@/app/serp_api/webSearch'

export const getHtmlRes = async (args: { query: string }) => {
    try {
        const response = await search(args.query);
        const firstRes = response.organic_results[0];
        const link = firstRes.link;
        try {
            const res = await fetch(link);
            const body = await res.text();
            const parser = new DOMParser();
            const html = parser.parseFromString(body, 'text/html');
            return html.querySelector('body')?.innerHTML;
        } catch {
            return 'Could not fetch web results.'
        }
    } catch {
        return 'Could not perform web search.'
    }
}

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
