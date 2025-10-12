"use server";

import { PrismaClient } from "../../../generated/prisma";
import { Conversation, Query } from "./types";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function createSession(conversation: Conversation = {}) {
    // Create a new session table
    try {
        const session = await prisma.session.create({
            data: { ...conversation },
        });
        return { status: "success", session };
    } catch (e) {
        return { status: "failure", e };
    } finally {
        revalidatePath("/");
    }
}

async function createConversation({ role, content, model, sessionId }: Query) {
    try {
        const conversation = await prisma.conversation.create({
            data: {
                content: content,
                model: model,
                role: role,
                sessionId: sessionId as number,
            },
        });
        return { status: "success", conversation };
    } catch (e) {
        return { status: "failure", e };
    } finally {
        revalidatePath("/");
    }
}

async function getSession(seshId: number | null) {
    try {
        if (seshId == null) {
            return { status: "failure" };
        }
        const session = await prisma.session.findUnique({
            where: { id: seshId },
        });
        return ({ status: "success", payload: session });
    } catch {
        return { status: "failure", payload: [] };
    } finally {
        revalidatePath("/");
    }
}

async function getAllConversationsForASession(seshId: number) {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { sessionId: { equals: seshId } },
        });
        return ({ status: "success", payload: conversations });
    } catch {
        return { status: "failure", payload: [] };
    }
}

async function getFirstConversationForASession(seshId: number): Promise<{status: string, payload: Conversation}> {
    try {
        const conversations = await prisma.conversation.findFirst({
            where: { sessionId: { equals: seshId } },
        });
        if (conversations === null) {
            return { status: "failure", payload: [] as Conversation[] };
        }
        return ({ status: "success", payload: conversations});
    } catch {
        return { status: "failure", payload: [] as Conversation[] };
    }
}

async function getArchivedSessions() {
    try {
        const sessions = await prisma.session.findMany({
            where: {
                archived: true
            }
        });
        return ({ status: "success", payload: sessions });
    } catch {
        return { status: "failure", payload: [] };
    }
}

async function getLiveSessions() {
    try {
        const sessions = await prisma.session.findMany({
            where: {
                archived: false,
            }
        });
        return ({ status: "success", payload: sessions });
    } catch {
        return { status: "failure", payload: [] };
    } finally {
        revalidatePath("/");
    }
}

async function getConversation(convoID: number) {
    return convoID;
}

async function deleteConversations(seshId: number) {
    try {
        await prisma.conversation.deleteMany({
            where: {
                sessionId: seshId,
            },
        });
        return { status: "success" };
    } catch (e) {
        return { status: "failure", message: `${e}` };
    }
}

async function deleteSession(seshId: number) {
    try {
        await prisma.session.delete({
            where: {
                id: seshId,
            },
        });
        return { status: "success" };
    } catch (e) {
        return { status: "failure", message: `${e}` };
    }
}

async function archiveSession(seshId: number) {
    try {
        await prisma.session.update({
         where: {
            id: seshId,
        },
        data: {
            archived: true,
        }});
        return { status: "success" };
    } catch (e) {
        return { status: "failure", message: `${e}` };
    } finally {
        revalidatePath("/");
    }
}

export {
    archiveSession,
    createConversation,
    createSession,
    deleteConversations,
    deleteSession,
    getAllConversationsForASession,
    getArchivedSessions,
    getLiveSessions,
    getConversation,
    getFirstConversationForASession,
    getSession,
};
