"use server"

import { PrismaClient } from "../../../generated/prisma";
import { Conversation, Query } from  "./types"
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

async function createSession(conversation: Conversation = {}) {
    // Create a new session table
    try {
        const session = await prisma.session.create({ data: { ...conversation } })
        return {status: 'success', session}
    } catch (e) {
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

async function getFirstConversationForASession(seshId: number) {
    try {
        const conversations = await prisma.conversation.findFirst({ where: {sessionId: {equals: seshId}}})
        return ({status: 'success', payload: conversations})
    } catch (e) {
        console.log(e)
        throw new Error(`Could not get all conversations for sessionId: ${seshId}`)
    }
}

async function getAllSessions() {
    try {
        const sessions = await prisma.session.findMany()
        return ({status: 'success', payload: sessions})
    } catch (e) {
        console.log(e)
        return {status: 'failure', payload: []}
    } finally {
        revalidatePath('/')
    }
}

async function getConversation(convoID: number) {
    return convoID;
}

async function deleteConversations(seshId: number) {
    try {
        const deletedConversations = await prisma.conversation.deleteMany({
            where: {
                sessionId: seshId,
            },
          });
          console.log(deletedConversations)
          return {status: 'success'}
    } catch (e) {
        console.log(e)
        return {status: 'failure', message: `${e}`}
    }
}

async function deleteSession(seshId: number) {
    try {
        const deletedSession = await prisma.session.delete({
            where: {
              id: seshId,
            },
          });
          console.log(deletedSession)
          return {status: 'success'}
    } catch (e) {
        console.log(e)
        return {status: 'failure', message: `${e}`}
    }
}


export { createSession, createConversation, deleteConversations, deleteSession, getAllConversationsForASession, getFirstConversationForASession, getAllSessions, getConversation, getSession }
