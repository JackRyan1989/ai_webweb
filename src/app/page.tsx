"use client";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { chat, fetchModelList } from "./brains/ollama";
import { ChatResponse, ListResponse } from "ollama";
import SessionDisplay from "./components/sessionsDisplay";
import {
    createConversation,
    createSession,
    getAllConversationsForASession,
    getAllSessions,
    getSession,
} from "./db/query";
import { renderModelResult } from "./components/modelResponse";

function separateReasoning(response: string) {
    return response.split("</think>");
}

// Database wrapper function
async function fetchSessions(): Promise<
    { id: number; createdAt: Date }[] | []
> {
    const { status, payload } = await getAllSessions();
    if (status == "failure") {
        throw new Error("Failure loading sessions");
    }
    return payload;
}

// Database wrapper function
// Should only happen on page load when we are synchronizing to our database
async function initializeSession(session: number | null) {
    try {
        if (session == null) {
            return await createSession();
        } else {
            return await getSession(session);
        }
    } catch {
        throw new Error("Failed to initialize new session");
    }
}

// Database wrapper function
async function saveConversation(
    query: {
        role: string;
        model: string;
        sessionId: number | null;
        content: string;
    },
) {
    const convo = await createConversation(query);
    if (convo.status == "failure") {
        throw new Error("Failed to save conversation");
    }
    return convo;
}

export default function Home() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [reasoning, setReasoning] = useState("");
    const models = useRef([] as unknown as ListResponse);
    const [sessions, setSessions] = useState(
        {} as { id: number; createdAt: Date }[] | [],
    );
    const [session, setSession] = useState(null as unknown as number | null);

    // Ties database call to frontend app
    const sessionInit = () => {
        initializeSession(session).then((sessionData): void => {
            if (sessionData?.session) {
                setSession(sessionData?.session.id);
            } else if (sessionData?.payload) {
                setSession(sessionData?.payload.id);
            }
        }).catch((error) => {
            throw new Error(error);
        });
    };

    const createNewSession = (): void => {
        if (confirm("Are you sure you want to create a new session?")) {
            setResponse("");
            setReasoning("");
            setQuery("");
            setSession(null);

            fetchSessions().then((data): void => {
                setSessions(data);
            }).catch((error) => {
                throw new Error(error);
            });

            sessionInit();
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

        sessionInit();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    // This is what we want done when session changes:
    useEffect(() => {
        (async () => {
            if (typeof session == "number") {
                const { status, payload } =
                    await getAllConversationsForASession(session);
                if (status != "success") {
                    setResponse("");
                }
                const lastResponse = payload.pop();
                if (typeof lastResponse == "object") {
                    setResponse(lastResponse.content);
                } else {
                    setResponse("");
                }
            }
        })();
    }, [session]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(event?.target?.value ?? "");
    };

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResponse("pending");
        const formData = new FormData(event.target as HTMLFormElement);
        const content = String(formData.get("input"));
        let model = formData.get("selectedModel");

        if (typeof model != "string") {
            model = "deepseek-r1:1.5b";
        }

        const newQuery = {
            "role": "user",
            "content": content,
            "sessionId": session,
            model: model,
        };
        // Create user statement
        await saveConversation(newQuery);

        const convos = await getAllConversationsForASession(session!);
        let conversations: { role: string; content: string }[];
        if (convos.status == "success") {
            const { payload } = convos;
            conversations = payload.map((load) => {
                return { role: load.role, content: load.content };
            });
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
            "sessionId": session,
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
        } else {
            setReasoning("");
            setResponse(chatResponse.message.content);
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
                <form
                    id="oracleHole"
                    className="flex flex-col content-center gap-4 m-8"
                    onSubmit={async (event) => {
                        await handleSubmit(event);
                    }}
                >
                    <div className="m-auto p-0">
                        <label htmlFor="oracleHole">Ai WebWeb</label>
                        <p className="text-xs">
                            for to make conversation with the brains
                        </p>
                    </div>
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
                            {models.current.models?.length > 0
                                ? models?.current.models.map((model) => {
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
                <section aria-labelledby="output" className="m-8 p-2">
                    <h2 id="output" className="sr-only">Output</h2>
                    <div id="outputContainer">
                        {renderModelResult(reasoning, response)}
                    </div>
                </section>
            </div>
        </main>
    );
}
