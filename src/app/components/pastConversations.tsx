import { ReactNode } from "react";
import Markdown from "react-markdown";

interface PastConversationsProps {
    pastConversations: {role: string; content: string}[]; // Replace 'any[]' with the appropriate type if known
}

export default function PastConversations({ pastConversations }: PastConversationsProps): ReactNode {
    return (
        pastConversations ?
            <details>
                <summary>
                    Conversation History
                </summary>
                {pastConversations.map((conversation, index) => {
                    const {content, role} = conversation
                    return (
                        <div className="px-2 m-2" key={content.replaceAll(" ", '-')} id={role}>
                            <p className={`mx-1 p-1 rounded-1 ${role === 'user' ? 'bg-blue-100': 'bg-blue-200'}`}><span>{index + 1}{'. '}</span>{role}</p>
                            <Markdown>{content}</Markdown>
                        </div>
                    )
                })}
            </details> : null
    )
}
