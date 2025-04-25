"use server"

import { PrismaClient } from "../../../generated/prisma";
import { Conversation, Query } from  "./types"

const prisma = new PrismaClient()

async function createSession(conversation: Conversation = {}) {
    // Create a new session table
    try {
        const session = await prisma.session.create({ data: { ...conversation } })
        console.log("Session:", session)
        return {status: 'success', session}
    } catch (e) {
        console.log(e)
        return {status: 'failure', e}
    }
}

async function createConversation({role, content, sessionId}: Query) {
    // Create a new conversation table
    try {
        const conversation = await prisma.conversation.create({
            data: {
                role: role,
                content: Array.isArray(content) ? content.join('\n'): content,
                sessionId: sessionId
            }
        })
        console.log("Conversation:", conversation)
        return {status: 'success', conversation}
    } catch (e) {
        console.log(e)
        return {status: 'failure', e}
    }
}

async function getSession(id: number) {
    return id
}

async function getAllConversations(seshID: number) {
    return seshID;
}

async function getAllSessions() {
    try {
        const sessions = await prisma.session.findMany()
        return ({status: 'success', payload: sessions})
    } catch (e) {
        console.log(e)
        return {status: 'failure', payload: e}
    }
}

async function getConversation(convoID: number) {
    return convoID;
}

async function updateSession(req) {
    // Not sure we'll need this because the linkage is already in the table schema
    return req
}

async function updateConversation(req) {
    // Basically add new content to conversation content
    return req
}



// main().then(async () => {
//     await prisma.$disconnect()
// }).catch( async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
// })

export { createSession, createConversation, getAllConversations, getAllSessions, getConversation, getSession, updateConversation, updateSession }
