"use server"

import { PrismaClient } from "../../../generated/prisma";
import { Conversation, Query } from  "./types"
import { revalidatePath } from 'next/cache'

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
    } finally {
        revalidatePath('/')
    }
}

async function createConversation({role, content, model, sessionId}: Query) {
    // Create a new conversation table
    try {
        const conversation = await prisma.conversation.create({
            data: {
                content: Array.isArray(content) ? content.join('\n'): content,
                model: model,
                role: role,
                sessionId: sessionId as number
            }
        })
        console.log("Conversation:", conversation)
        return {status: 'success', conversation}
    } catch (e) {
        console.log(e)
        return {status: 'failure', e}
    } finally {
        revalidatePath('/')
    }
}

async function getSession(id: number) {
    return id
}

async function getAllConversationsForASession(seshID: number) {
    try {
        const conversations = await prisma.conversation.findMany({ select: {sessionId: seshID}})
        return ({status: 'success', payload: conversations})
    } catch (e) {
        console.log(e)
        return {status: 'failure', payload: e}
    } finally {
        revalidatePath('/')
    }
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

export { createSession, createConversation, getAllConversationsForASession, getAllSessions, getConversation, getSession, updateConversation, updateSession }
