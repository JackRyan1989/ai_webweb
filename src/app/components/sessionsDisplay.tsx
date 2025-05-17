"use client";

import { ReactNode, useEffect, useState } from "react";
import { getFirstConversationForASession } from '../db/query'

const sessionHandler = (id: number, sessionSetter: (id: number) => void) => {
    if (confirm(`Set Session ID to ${id}?`)) {
        sessionSetter(id);
    }
    return
};

export default function SessionDisplay(
    { sessions = [], sessionSetter, session }: {
        sessions: [] | { id: number; createdAt: Date }[];
        sessionSetter: (id: number) => void;
        session: number | null;
    },
): ReactNode | Array<ReactNode> {

    const [conversations, setConversations] = useState<string[]>([]);

    useEffect(() => {
            sessions.forEach(async ({id}) => {
                const {status, payload} = await getFirstConversationForASession(id)
                if (status == 'success' && payload?.content.length !== undefined) {
                    setConversations([...conversations, payload.content])
                } else {
                    return
                }
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessions])

    return (
        sessions.map((sesh: { id: number }, index: number) => (
            <button
                onClick={() => sessionHandler(sesh.id, sessionSetter)}
                className={`min-w-min text-sm border-solid border-black outline p-[.5rem] m-[.5rem] rounded-xs ${session === sesh.id ? 'bg-lime-200' : 'bg-transparent'}`}
                key={sesh.id}
                id={String(sesh.id)}
            >
                {conversations[index]?.length > 0 ? conversations[index] : <span>Loading session...</span>}
            </button>
        ))
    );
}
