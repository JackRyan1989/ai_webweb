import {createConversation, createSession, getAllSessions, getSession} from "@/app/db/query";

export async function fetchSessions(): Promise<
    { id: number; createdAt: Date }[] | []
> {
    const { status, payload } = await getAllSessions();
    if (status == "failure") {
        throw new Error("Failure loading sessions");
    }
    return payload;
}

export async function initializeSession(session: number | null) {
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

export async function saveConversation(
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