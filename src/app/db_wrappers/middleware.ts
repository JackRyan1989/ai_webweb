import {
    createConversation,
    createSession,
    deleteConversations,
    deleteSession,
    getLiveSessions,
    getSession,
} from "@/app/db/query";

// These are not archived sessions
export async function fetchLiveSessions(): Promise<
    { id: number; createdAt: Date ; archived: boolean}[] | []
> {
    const { status, payload } = await getLiveSessions();
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
