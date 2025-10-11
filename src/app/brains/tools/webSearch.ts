'use server'
import search from '@/app/serp_api/webSearch'
import { JSDOM } from "jsdom"

export const getHtmlRes = async (args: { query: string }) => {
    try {
        const response = await search(args.query);
        const firstRes = response.organic_results[0];
        const link = firstRes.link;
        try {
            const res = await fetch(link);
            const body = await res.text();
            const { document } = new JSDOM(body).window;
            const html = document.querySelector('body')?.innerHTML;
            return html
        } catch(e) {
            console.log(e)
            return 'Could not fetch web results.'
        }
    } catch {
        return 'Could not perform web search.'
    }
}
