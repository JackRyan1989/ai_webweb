"use client";

import { ReactNode, useEffect, useRef } from "react";
import { getFirstConversationForASession } from '../db/query'

const sessionHandler = (id: number, sessionSetter: (id: number) => void) => {
    window.alert(`Set Session ID to ${id}?`);
    sessionSetter(id);
};

export default function SessionDisplay(
    { sessions = [], sessionSetter, session }: {
        sessions: [] | { id: number; createdAt: Date }[];
        sessionSetter: (id: number) => void;
        session: number | null;
    },
): ReactNode | Array<ReactNode> {

    const conversations = useRef([] as string[]);

    useEffect(() => {
            sessions.forEach(async ({id}) => {
                const {status, payload} = await getFirstConversationForASession(id)
                if (status == 'success') {
                    conversations.current.push(payload?.content ?? `Resume session \#${id}`)
                } else {
                    return
                }
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        sessions.map((sesh: { id: number }, index: number) => (
            <button
                onClick={() => sessionHandler(sesh.id, sessionSetter)}
                className={`min-w-min text-sm border-solid border-black outline p-[.5rem] m-[.5rem] rounded-xs ${session === sesh.id ? 'bg-lime-200' : 'bg-transparent'}`}
                key={sesh.id}
                id={String(sesh.id)}
            >
                {conversations.current[index] || <span>Loading session...</span>}
            </button>
        ))
    );
}
