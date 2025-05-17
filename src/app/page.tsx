"use client";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { chat, fetchModelList } from "./brains/ollama";
import { ChatResponse, ListResponse } from "ollama";
import SessionDisplay from "./components/sessionsDisplay";
import {
    getAllConversationsForASession,
} from "./db/query";
import { RenderModelResult } from "./components/modelResponse";
import PastConversations from "./components/pastConversations";
import {fetchSessions, initializeSession, saveConversation} from "@/app/db_wrappers/middleware";

function separateReasoning(response: string) {
    return response.split("</think>");
}

export default function Home() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState<boolean | null>(null);
    const [reasoning, setReasoning] = useState("");
    const models = useRef<ListResponse>(null);
    const [sessions, setSessions] = useState<{ id: number; createdAt: Date }[] | []>(
        []
    );
    const [session, setSession] = useState<number | null>(null);
    const [allConversations, setAllConversations] = useState<{ role: string; content: string }[]>([])

    const createNewSession = (): void => {
        if (confirm("Are you sure you want to create a new session?")) {
            setResponse("");
            setReasoning("");
            setQuery("");
            setSession(null);
        }
    };

    // This is what we want done on page load
    useEffect(() => {
        try {
            fetchModelList().then((mods) => models.current = mods);
        } catch {
            throw new Error("Failed to fetch models");
        }

        fetchSessions().then((data): void => {
            setSessions(data);
        }).catch((error) => {
            throw new Error(error);
        });
    },
    []);

    // This is what we want done when session changes:
    useEffect(() => {
        (async () => {
            if (session) {
                const { status, payload } =
                    await getAllConversationsForASession(session);
                if (status != "success") {
                    setResponse("");
                }
                const lastResponse = payload.pop();
                setAllConversations(payload)
                if (typeof lastResponse == "object" && lastResponse.role === 'assistant') {
                    setResponse(lastResponse.content);
                } else {
                    setResponse("");
                }
            } else {
                setResponse("")
            }
        })();
    }, [session]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(event?.target?.value ?? "");
    };

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResponse("pending");
        setLoading(true);
        const formData = new FormData(event.target as HTMLFormElement);
        const content = String(formData.get("input"));
        const model = formData.get("selectedModel") as string;
        let localSessionVar: number | null = null

        if (session === null) {
            const sessionData = await initializeSession(session);
            if ("session" in  sessionData && sessionData?.session) {
                setSession(sessionData?.session.id);
                localSessionVar = sessionData?.session.id
            } else if ("payload" in sessionData && sessionData?.payload) {
                setSession(sessionData?.payload.id);
                localSessionVar = sessionData?.payload.id;
            }
            fetchSessions().then(setSessions);
        }

        const newQuery = {
            "role": "user",
            "content": content,
            "sessionId": session ?? localSessionVar,
            model: model,
        };
        // Create user statement
        await saveConversation(newQuery);

        const convos = await getAllConversationsForASession(session ?? localSessionVar!);
        let conversations: { role: string; content: string }[];
        if (convos.status == "success") {
            const { payload } = convos;
            conversations = payload.map((load) => {
                return { role: load.role, content: load.content, sessionId: load.sessionId, };
            });
            setAllConversations(conversations)
        } else {
            throw new Error("Could not load conversations");
        }

        const chatResponse = await chat(
            conversations,
            model,
        );

        const newResponse = {
            "role": "assistant",
            "content": (chatResponse as ChatResponse).message.content,
            "sessionId": session ?? localSessionVar,
            model: model,
        };

        // Create model response statement
        await saveConversation(newResponse);

        if (model == "deepseek-r1:1.5b") {
            const [responseReasoning, responseContent] = separateReasoning(
                chatResponse.message.content,
            );
            setReasoning(responseReasoning);
            setResponse(responseContent);
            setLoading(false);
        } else {
            setReasoning("");
            setResponse(chatResponse.message.content);
            setAllConversations([...conversations, newResponse])
            setLoading(false);
        }
    };

    return (
        <main className="m-auto grid grid-cols-12 grid-rows-1 gap-1 max-w-screen">
            <aside className="sticky col-span-2 left-0 bg-white border-r-2 border-black">
                <>
                    {sessions.length > 0
                        ? (
                            <SessionDisplay
                                sessions={sessions}
                                sessionSetter={setSession}
                                session={session}
                            />
                        )
                        : <span>No sessions available.</span>}
                </>
            </aside>
            <div className="col-span-10">
                <div className="text-center">
                        <label htmlFor="oracleHole">Ai WebWeb</label>
                        <p className="text-xs">
                            for to make conversation with the brains
                        </p>
                    </div>
                    <section aria-labelledby="output" className="mx-8 mt-8 mb-0 p-2">
                    <h2 id="output" className="sr-only">Output</h2>
                    <PastConversations pastConversations={allConversations} />
                    <div id="outputContainer">
                        <RenderModelResult loading={loading} reasoning={reasoning} response={response}/>
                    </div>
                </section>
                <form
                    id="oracleHole"
                    className="flex flex-col content-center gap-4 m-8"
                    onSubmit={async (event) => {
                        await handleSubmit(event);
                    }}
                >

                    <div className="flex flex-col">
                        <label
                            className="text-xs m-0 h-min"
                            htmlFor="modelSelect"
                        >
                            Select brain
                        </label>
                        <select
                            name="selectedModel"
                            id="modelSelect"
                            className="w-min p-0 m-0"
                        >
                            {models?.current && models.current.models?.length > 0
                                ? models.current.models.map((model) => {
                                    return (
                                        <option
                                            key={model.model}
                                            value={model.model}
                                        >
                                            {model.name}
                                        </option>
                                    );
                                })
                                : null}
                        </select>
                    </div>
                    <textarea
                        className="border-2 rounded p-2"
                        id="input"
                        name="input"
                        rows={7}
                        cols={33}
                        value={query}
                        onChange={(event) => handleInput(event)}
                        minLength={1}
                        required={true}
                    >
                    </textarea>
                    <button
                        className="m-auto bg-black border-black border-2 text-amber-50 p-2 w-max rounded hover:bg-white hover:text-black focus:bg-white focus:text-black "
                        type="submit"
                    >
                        Talk to me
                    </button>
                    <button
                        onClick={createNewSession}
                        className="m-auto bg-black border-black border-2 text-amber-50 p-2 w-max rounded hover:bg-white hover:text-black focus:bg-white focus:text-black"
                        type="button"
                    >
                        Create New Session
                    </button>
                </form>
            </div>
        </main>
    );
}
