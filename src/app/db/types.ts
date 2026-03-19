export interface Session {
    id: number,
    conversations: Conversation[],
    createdAt: Date
  }

 export interface Conversation {
    id: number
    session?: Session
    sessionId: number
    role: string
    content: string
    images: Image | null
    createdAt: Date
    model: string
  }

  export interface Image {
    "url": string
  }

  export interface Query {
    role: string
    content: string
    sessionId: number | null
    images: Array<string> | null
    model: string
  }
