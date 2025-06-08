"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { getFirstConversationForASession } from "../db/query";

const sessionHandler = (id: number, sessionSetter: (id: number) => void) => {
    sessionSetter(id);
};

export default function SessionDisplay(
    { sessions = [], sessionSetter, session }: {
        sessions: [] | { id: number; createdAt: Date }[];
        sessionSetter: (id: number) => void;
        session: number | null;
    },
): ReactNode | Array<ReactNode> {
    const [conversations, setConversations] = useState<
        { content: string; sessionId: number }[]
    >([]);
    const interMedArray = useRef<{ content: string; sessionId: number }[]>([]);

    useEffect(() => {
        sessions.forEach(async ({ id }) => {
            const { status, payload } = await getFirstConversationForASession(
                id,
            );
            if (status == "success" && payload?.content.length !== undefined) {
                interMedArray.current = [...interMedArray.current, {
                    content: payload.content,
                    sessionId: payload.sessionId,
                }];
                setConversations([...interMedArray.current, {
                    content: payload.content,
                    sessionId: payload.sessionId,
                }]);
            } else {
                return;
            }
        });
    }, [sessions]);

    return (
        sessions.map((sesh: { id: number }) => {
            const currConvo = conversations.filter((convo) =>
                convo.sessionId === sesh.id
            )[0];
            return (
                <button
                    onClick={() => sessionHandler(sesh.id, sessionSetter)}
                    className={`min-w-min text-sm border-solid border-black outline p-[.5rem] m-[.5rem] rounded-xs ${
                        session === sesh.id ? "bg-lime-200" : "bg-transparent"
                    }`}
                    key={sesh.id}
                    id={String(sesh.id)}
                    style={{'width': '-webkit-fill-available',
                        'wordWrap': 'break-word'}}
                >
                    {currConvo?.content ?? <span>Loading session...</span>}
                </button>
            );
        })
    );
}
