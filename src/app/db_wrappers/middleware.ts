import {
    createSession,
    getSession,
} from "@/app/db/query";

export async function initializeSession(session: number | null) {
    try {
        if (session == null) {
            return await createSession();
        } else {
            return await getSession(session);
        }
    } catch {
        return {
            status: 'failure',
            session: {},
        }
    }
}
