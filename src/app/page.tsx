"use client";
import { SyntheticEvent, useEffect, useRef, useState} from "react";
import {chat, list} from "./brains/ollama";
import {ChatResponse, ListResponse} from "ollama";
import Markdown from "react-markdown";
import Image from "next/image";
import blinkie from "../../public/blinkiesCafe-6b.gif";
import {createConversation, createSession, getAllConversationsForASession, getAllSessions, getSession} from "./db/query"

function separateReasoning(response: string) {
    return response.split("</think>");
}

function renderReasoning(reasoning: string) {
    return (
        <details>
            <summary>Rationale</summary>
            {reasoning.replaceAll("<think>", "")}
        </details>
    );
}

function renderResponse(reasoning: string, response: string) {
    return response === "pending"
        ? (
            <Image
                src={blinkie}
                width={300}
                height={40}
                alt="Picture of the author"
                className="m-auto"
                unoptimized
            />
        )
        : (
            <div className="prose">
                {reasoning.length > 0 ? renderReasoning(reasoning) : null}
                <Markdown>{response}</Markdown>
            </div>
        );
}

async function fetchModelList() {
    return await list();
}

async function fetchSessions(): Promise<{ id: number, createdAt: Date }[] | []> {
    const {status, payload} = await getAllSessions()
    if (status == "failure") {
        throw new Error('Failure loading sessions')
    }
    return payload
}

// Should only happen on page load when we are synchronizing to our database
async function initializeSession({current}: React.RefObject<number | null>) {
    try {
        if (current == null) {
            return await createSession()
        } else {
            return await getSession(current)
        }
    } catch {
        throw new Error("Failed to initialize new session")
    }
}

async function saveConversation(query: { role: string; model: string; sessionId: number | null; content: string }) {
    const convo = await createConversation(query)
    if (convo.status == "failure") {
            throw  new Error("Failed to save conversation")
    }
    return convo;
}

export default function Home() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [reasoning, setReasoning] = useState("");
    const models = useRef([] as unknown as ListResponse)
    const [sessions, setSessions] = useState({} as { id: number; createdAt: Date; }[] | [])
    const session = useRef(null as number | null);

    const sessionInit = () => {
        initializeSession(session).then((sessionData): void => {
            if (sessionData?.session) {
                session.current = sessionData?.session.id
            } else if (sessionData?.payload) {
                session.current = sessionData?.payload.id
            } else {
                session.current = null
            }
        }).catch((error) => {
            throw new Error(error)
        });
    }

// This is what we want done on page load
    useEffect(() => {
            try {
                fetchModelList().then((mods) => models.current = mods);
            } catch {
                throw new Error("Failed to fetch models")
            }

            fetchSessions().then((data): void => {
                setSessions(data)
            }).catch((error) => {
                throw new Error(error)
            });

            sessionInit();
        },
        []);

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

        const newQuery = {"role": "user", "content": content, "sessionId": session.current, model: model};
        // Create user statement
        await saveConversation(newQuery)

        const convos = await getAllConversationsForASession(session.current as current);
        let conversations: { role: string; content: string; }[];
        if (convos.status == "success") {
            const {payload} = convos;
            conversations = payload.map((load) => {
                return {role: load.role, content: load.content};
            })
        } else {
            throw new Error('Could not load conversations')
        }

        const chatResponse = await chat(
            conversations,
            model,
        );

        const newResponse = {
            "role": "assistant",
            "content": (chatResponse as ChatResponse).message.content,
            "sessionId": session.current,
            model: model
        };

        // Create model response statement
        await saveConversation(newResponse)

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

    const createNewSession = (): void => {
        if (confirm("Are you sure you want to create a new session?")) {
            sessionStorage.clear();
            setResponse("");
            setReasoning("");
            setQuery("");
            session.current = null;

            fetchSessions().then((data): void => {
                setSessions(data)
            }).catch((error) => {
                throw new Error(error)
            });

            sessionInit();
        }
    };

    const sessionHandler=  (id: number) => {
        window.alert(`Session ID: ${id}`);
    }

    return (
        <main className="m-auto grid grid-cols-12 grid-rows-1 gap-1 max-w-screen">
            <aside className="sticky col-span-2 left-0 bg-white border-r-2 border-black">
                {sessions.length > 0 &&
                sessions.map((sesh) => (
                <button onClick={() => sessionHandler(sesh.id)} className='min-w-min text-sm border-solid border-black outline p-[.5rem] m-[.5rem] rounded-xs bg-lime-100' key={sesh.id} id={String(sesh.id)}>Restore session {sesh.id}</button>
                )
                )}
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
                        <p className="text-xs">for to make conversation with the brains</p>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs m-0 h-min" htmlFor="modelSelect">
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
                                        <option key={model.model} value={model.model}>
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
                        {renderResponse(reasoning, response)}
                    </div>
                </section>
            </div>
        </main>
    );
}
