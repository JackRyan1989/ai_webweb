'use server'

import {getAllSessions} from "../db/query"

const sessionHandler=  (id: number) => {
    window.alert(`Session ID: ${id}`);
}

export default async function SessionDisplay() {
    let sessions = [];
    try {
        const {status, payload} = await getAllSessions()
        if (status == "failure") {
            throw new Error('getAllSessions ran, but returned an error in the payload.')
        }
        sessions = payload;
    } catch {
        throw new Error('Could not load sessions')
    }

    return (
        sessions.length > 0 &&
        sessions.map((sesh) => (
                <button onClick={() => sessionHandler(sesh.id)} className='min-w-min text-sm border-solid border-black outline p-[.5rem] m-[.5rem] rounded-xs bg-lime-100' key={sesh.id} id={String(sesh.id)}>Restore session {sesh.id}</button>
            )
        )

    )
}
