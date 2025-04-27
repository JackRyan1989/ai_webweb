export default function SessionDisplay(sessions: []) {
    return (
        sessions.map((session) => <div key={session?.sessionId}>{session}</div>)
    )
}
