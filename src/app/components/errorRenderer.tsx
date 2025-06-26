import { ErrorObj } from "../brains/ollama"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ErrorRenderer({errStatus, message }: ErrorObj) {
    return (
        <dialog open className="border-4 rounded-2xl border-amber-600 absolute m-auto top-[50%] p-8">
            <p>{message}</p>
            <form className="m-auto" method="dialog">
                <button className="border-2 rounded-2xl border-gray-400 p-2 hover:text-pink-50 hover:bg-black">OK, let&apos;s try again.</button>
            </form>
        </dialog>
    )
}
