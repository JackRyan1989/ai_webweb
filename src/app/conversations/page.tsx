import {
    getArchivedSessions,
    getFirstConversationForASession,
} from "@/app/db/query";
import Header from "../components/header";
import MainContent from "../components/mainContent";
import trimToLength from "../utils/trimToLength";
import { Conversation } from "../db/types";
import Link from "next/link";

export default async function Page() {
    const { status, payload } = await getArchivedSessions();
    const ErrorLoadingContent = () => {
        return (
            <p>
                Could not load conversations from sessions list. Do you have any
                archived sessions?
            </p>
        );
    };
    const allConvos = [] as Conversation[];

    if (status === "success") {
        // Gather all conversations for each session in parallel
        const convoResults = await Promise.all(
            payload.map(async ({ id }) => {
                const { status, payload: convos } =
                    await getFirstConversationForASession(id);
                return status === "success" ? convos : null;
            }),
        );
        allConvos.push(
            ...convoResults.filter((convos): convos is Conversation =>
                convos !== null
            ),
        );
    }

    const ConversationList = () => {
        return (allConvos.length === 0 ? <p>No conversations to list.</p> : (
            <ul>
                {allConvos.map(({ id, content, sessionId, createdAt }) => {
                    return (
                        <li className="list-disc" key={id}>
                            <Link
                                className="hover:underline hover:decoration-1 hover:underline-offset-4"
                                href={`/conversations/${sessionId}`}
                            >
                                {createdAt.toLocaleDateString()}{" "}
                                {trimToLength(content)}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        ));
    };

    return (
        <MainContent>
            <Header destination="/" linkText="Home" />
            {status !== "success"
                ? <ErrorLoadingContent />
                : <ConversationList />}
        </MainContent>
    );
}
