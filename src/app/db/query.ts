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
                content: content,
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

async function getSession(seshId: number | null) {
    try {
        if (seshId == null) {
            return {status: 'failure'}
        }
        const session = await prisma.session.findUnique({ where: {id: seshId}})
        return ({status: 'success', payload: session})
    } catch (e) {
        console.log(e)
        throw new Error(`Could not get all conversations for sessionId: ${seshId}`)
    } finally {
        revalidatePath('/')
    }
}

async function getAllConversationsForASession(seshId: number) {
    try {
        const conversations = await prisma.conversation.findMany({ where: {sessionId: {equals: seshId}}})
        return ({status: 'success', payload: conversations})
    } catch (e) {
        console.log(e)
        throw new Error(`Could not get all conversations for sessionId: ${seshId}`)
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
        return {status: 'failure', payload: null}
    } finally {
        revalidatePath('/')
    }
}

async function getConversation(convoID: number) {
    return convoID;
}

// async function updateSession(req) {
//     // Not sure when we'll need this because the linkage is already in the table schema
//     return req
// }
//
// async function updateConversation(req) {
//     // Basically add new content to conversation content
//     return req
// }

export { createSession, createConversation, getAllConversationsForASession, getAllSessions, getConversation, getSession }
