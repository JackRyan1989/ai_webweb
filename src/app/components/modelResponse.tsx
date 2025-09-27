import Markdown from "react-markdown";
import Image from "next/image";
import blinkie from "../../../public/blinkiesCafe-6b.gif";

function RenderReasoning({ reasoning }: { reasoning: string }) {
    return (
        <details>
            <summary>Rationale</summary>
            {reasoning.replaceAll("<think>", "").replaceAll("</think>", "")}
        </details>
    );
}

export function RenderModelResult(
    { loading, reasoning, response }: {
        loading: boolean | null;
        reasoning: string;
        response: string;
    },
) {
    return loading === true
        ? (
            <Image
                src={blinkie}
                width={300}
                height={40}
                alt="Picture of the author"
                className="m-auto py-2"
                unoptimized
            />
        )
        : (
            <div className="prose">
                {reasoning.length > 0
                    ? <RenderReasoning reasoning={reasoning} />
                    : null}
                <hr className="py-1" />
                <p className="mx-1 p-2 text-center rounded-[7] dark:text-black dark:bg-white italic bg-blue-200">
                    assistant
                </p>
                <Markdown>{response}</Markdown>
            </div>
        );
}
