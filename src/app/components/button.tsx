import { ReactNode } from "react";

export default function Button({ clickHandler, children, type }: {clickHandler?: () => void, children: ReactNode, type: HTMLButtonElement["type"]}): ReactNode {
    return (
        <button
            onClick={clickHandler}
            className="my-2 dark:bg-white dark:hover:border-white dark:hover:bg-black dark:hover:text-white dark:text-black bg-black border-black border-2 text-amber-50 p-2 w-max rounded hover:bg-white hover:text-black focus:bg-white focus:text-black"
            type={type}
        >
            {children}
        </button>
    )
}
