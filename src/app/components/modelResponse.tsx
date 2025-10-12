import Markdown from "react-markdown";
import Image from "next/image";
import blinkie from "../../../public/blinkiesCafe-6b.gif";

export function RenderModelResult(
    { loading, response }: {
        loading: boolean | null;
        response: string;
    },
) {
    const responseWithReasoning = response.replace('<think>', '<code>').replace('</think>', '</code>');

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
                <hr className="py-1" />
                <p className="mx-1 p-2 text-center rounded-[7] dark:text-black dark:bg-white italic bg-blue-200">
                    assistant
                </p>
                <Markdown>{responseWithReasoning}</Markdown>
            </div>
        );
}
