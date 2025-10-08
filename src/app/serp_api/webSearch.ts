'use server'
import { getJson, BaseResponse, EngineParameters } from "serpapi";
import '../../../envConfig.ts'

const search = async (query: string, engine = "duckduckgo"): Promise<BaseResponse | EngineParameters> => {
    const response = await getJson({
        engine: engine,
        api_key: process.env.SERPAPI_KEY,
        q: query,
        kl: "us-en",
    });

    return response;
}

export default search;

