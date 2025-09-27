import {
    createConversation,
    createSession,
    deleteConversations,
    deleteSession,
    getAllSessions,
    getSession,
} from "@/app/db/query";

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

export async function sessionDelete(sessionId: number) {
    try {
        const deletedConvos = await deleteConversations(sessionId);
        if (deletedConvos.status === "failure") {
            throw new Error("Failed to delete associated. conversations");
        }
        return await deleteSession(sessionId);
    } catch {
        throw new Error("Failed to delete session");
    }
}
