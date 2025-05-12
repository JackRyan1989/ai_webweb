import Markdown from "react-markdown";
import Image from "next/image";
import blinkie from "../../../public/blinkiesCafe-6b.gif";

function renderReasoning(reasoning: string) {
    return (
        <details>
            <summary>Rationale</summary>
            {reasoning.replaceAll("<think>", "")}
        </details>
    );
}

export function renderModelResult(reasoning: string, response: string) {
    return response === "pending"
        ? (
            <Image
                src={blinkie}
                width={300}
                height={40}
                alt="Picture of the author"
                className="m-auto"
                unoptimized
            />
        )
        : (
            <div className="prose">
                {reasoning.length > 0 ? renderReasoning(reasoning) : null}
                <Markdown>{response}</Markdown>
            </div>
        );
}
