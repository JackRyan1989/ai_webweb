"use client";
import { BaseSyntheticEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { chat, PayloadObj, fetchModelList } from "./brains/ollama";
import { ChatResponse } from "ollama";
import Header from "./components/header";
import LeftRail from "./components/leftRail";
import MainContent from "./components/mainContent";
import SessionDisplay from "./components/sessionsDisplay";
import Button from "./components/button";
import Toaster from "./components/toaster/toaster";
import toastEmitter from "./components/toaster/toastEmitter";
import { getAllConversationsForASession } from "./db/query";
import { RenderModelResult } from "./components/modelResponse";
import PastConversations from "./components/pastConversations";
import {
    initializeSession
} from "@/app/db_wrappers/middleware";
import { archiveSession as archSesh, createConversation ,getLiveSessions } from "./db/query";

export default function Home() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState<boolean | null>(null);
    const models = useRef<PayloadObj>({status: 'pending', payload: 'Models not loaded yet.'});
    const [model, setModel] = useState('');
    const [sessions, setSessions] = useState<
        { id: number; createdAt: Date; archived: boolean | undefined }[] | []
    >(
        [],
    );
    const [session, setSession] = useState<number | null>(null);
    const [allConversations, setAllConversations] = useState<
        { role: string; content: string }[]
    >([]);

    const createNewSession = (): void => {
        if (confirm("Are you sure you want to create a new session?")) {
            setResponse("");
            setQuery("");
            setSession(null);
            toastEmitter("New Session Created!", "info", 1000);
        }
    };

    const archiveSession = async (): Promise<void> => {
        if (session === null) return;
        if (confirm("Are you sure you want to archive this session?")) {
            const archivedSesh = await archSesh(session);
            if (archivedSesh.status === "failure") {
                toastEmitter(
                    archivedSesh.message ?? "Failure archiving session!",
                    "error",
                    2000,
                );
            }
            setResponse("");
            setQuery("");
            setSession(null);
            setAllConversations([]);
            getLiveSessions().then(({payload}) => setSessions(payload));
            toastEmitter("Session Archived", "info", 1000);
        }
    };

    // This is what we want done on page load
    useEffect(() => {
        (async () => {
            let res;
            try {
                res = await fetchModelList();
            } catch {
                res = {
                    status: "error",
                    payload:
                        "Issue fetching models. Make sure ollama is running.",
                };
            }
            if (res["status"] === "error" && typeof res.payload === 'string') {
                toastEmitter(res.payload, "error", 2000);
            } else {
                models.current = res;
            }
        })();
        getLiveSessions().then(({payload}) => setSessions(payload)).catch(() => {
            toastEmitter("Error fetching sessions.", "error", 2000);
        });
    }, []);

    // This is what we want done when session changes:
    useEffect(() => {
        (async () => {
            if (session) {
                const { status, payload } =
                    await getAllConversationsForASession(session);
                if (status != "success") {
                    setResponse("");
                    return;
                }
                const lastResponse = payload.pop();
                if (lastResponse) {
                    const { model } = lastResponse;
                    setModel(model)
                }
                setAllConversations(payload);
                if (
                    typeof lastResponse == "object" &&
                    lastResponse.role === "assistant"
                ) {
                    setResponse(lastResponse.content);
                } else {
                    setResponse("");
                }
            } else {
                setResponse("");
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
        let localSessionVar: number | null = null;

        if (session === null) {
            const sessionData = await initializeSession(session);
            if ("session" in sessionData && sessionData?.session && "id" in sessionData?.session) {
                setSession(sessionData?.session.id);
                localSessionVar = sessionData?.session.id;
            } else if (
                "payload" in sessionData && sessionData?.payload &&
                "id" in sessionData?.payload
            ) {
                setSession(sessionData?.payload.id);
                localSessionVar = sessionData?.payload.id;
            }
            getLiveSessions().then(({payload}) => setSessions(payload));
        }

        const newQuery = {
            "role": "user",
            "content": content,
            "sessionId": session ?? localSessionVar,
            model: model,
        };
        // Create user statement
        const userStatus = await createConversation(newQuery);
        if (userStatus.status === "failure") {
            toastEmitter("Failed to save conversation", "error", 2000);
        }

        const convos = await getAllConversationsForASession(
            session ?? localSessionVar!,
        );
        let conversations: { role: string; content: string }[];
        if (convos.status == "success") {
            const { payload } = convos;
            conversations = payload.map((load) => {
                return {
                    role: load.role,
                    content: load.content,
                    sessionId: load.sessionId,
                };
            });
            setAllConversations(conversations);
        } else {
            toastEmitter("Could not load conversations.", "error", 2000);
            return;
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
        const modelResponseStatus = await createConversation(newResponse);
        if (modelResponseStatus.status === "failure") {
            toastEmitter("Failed to save conversation", "error", 2000);
        }

            setResponse(chatResponse.message.content);
            setAllConversations([...conversations, newResponse]);
            setLoading(false);
        setQuery("");
    };

    const handleModelSelection = (e: BaseSyntheticEvent): void => {
        setModel(e.target.value);
    }

    return (
        <>
            <LeftRail>
                {sessions.length > 0
                    ? (
                        <SessionDisplay
                            sessions={sessions}
                            sessionSetter={setSession}
                            session={session}
                        />
                    )
                    : <span>No sessions available.</span>}

            </LeftRail>
            <MainContent>
                <Header destination="/conversations" linkText="Old Sessions" />
                <section
                    aria-labelledby="output"
                    className="mx-8 mt-8 mb-0 p-2"
                >
                    <h2 id="output" className="sr-only">Output</h2>
                    <PastConversations pastConversations={allConversations} />
                    <div id="outputContainer">
                        <RenderModelResult
                            loading={loading}
                            response={response}
                        />
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
                            className="w-min p-2 m-0 dark:border-white border-2 rounded"
                            value={model}
                            onChange={handleModelSelection}
                        >
                            {typeof models?.current.payload !== 'string'
                                ? models.current.payload.models.map((model) => {
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
                    <Button type="submit">
                        Talk to me
                    </Button>
                    <div className="flex flex-col">
                        <Button
                            clickHandler={createNewSession}
                            type="button"
                        >
                            Create New Session
                        </Button>
                        <Button
                            clickHandler={archiveSession}
                            type="button"
                        >
                            Archive Current Session
                        </Button>
                    </div>
                </form>
            </MainContent>
            <Toaster />
        </>
    );
}
