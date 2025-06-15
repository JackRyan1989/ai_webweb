import { ReactNode } from "react";
import Markdown from "react-markdown";

interface PastConversationsProps {
    pastConversations: {role: string; content: string}[]; // Replace 'any[]' with the appropriate type if known
}

function capitalize(title: string): string {
    const newTitle = [...title].map((letter, index) => index === 0 ? letter.toUpperCase() : letter).join('')
    return newTitle;
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
                    return ( (pastConversations.length === 1 || index < pastConversations.length) &&
                        <div className="px-2 m-2" key={content.replaceAll(" ", '-')} id={role}>
                            <h2 className={`mx-1 p-2 rounded-[7] italic ${role === 'user' ? 'dark:text-black dark:bg-white bg-blue-100': 'dark:text-black dark:bg-white bg-blue-200'}`}><span>{index + 1}{'. '}</span>{capitalize(role)}</h2>
                            <Markdown>{content}</Markdown>
                        </div>
                    )
                })}
            </details> : null
    )
}
