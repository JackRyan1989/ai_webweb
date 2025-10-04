export interface Session {
    id: number,
    conversations: Conversation[],
    createdAt: Date
  }

 export interface Conversation {
    id: number
    session?: Session
    sessionId: number
    role?: string
    content: string
    createdAt: Date
    archivedAt?: Date
    model?: string
  }

  export interface Query {
    role: string
    content: string
    sessionId: number | null
    model: string
  }
