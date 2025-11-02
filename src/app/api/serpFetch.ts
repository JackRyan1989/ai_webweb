'use server'
import { getJson } from "serpapi"
import type { BaseResponse } from "serpapi"
import "../../../envConfig";

const webFetch = async (query: string): Promise< {ok: boolean, message: string | BaseResponse}> => {

    if (!query) {
        return {
            ok: false,
            message: "You need to provide a query parameter."
        }
    }

    const options ={
        engine: 'duckduckgo',
        q: query,
        api_key: process.env.SERPAPI_KEY
    }

    try {
        const response = await getJson(options);
        const parsedResults = parseWebResults(response);
        return {
            ok: true,
            message: parsedResults
        }
    } catch(e) {
        return {
            ok: false,
            message: (e as Error).message ?? "Failure making duckduckgo search request."
        }
    }
}

const parseWebResults = (res: BaseResponse) => {
    const organic_results = res["organic_results"];
    const results = organic_results.reduce(({position, title, link}: {position: number, title: string, link: string}) => {
        return {
            position,
            title,
            link
        }
    }, {})
    return results
}


export default webFetch;
