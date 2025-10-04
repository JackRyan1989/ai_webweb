import { getAllConversationsForASession } from '../../db/query'
import Header from "../../components/header";
import MainContent from "../../components/mainContent";

export default async function Page({
  params,
}: {
  params: Promise<{ conversations: string }>
}) {
  const { conversations } = await params
  const { status, payload } = await getAllConversationsForASession(Number(conversations));

  return (
    <MainContent>
      <Header destination="/conversations" linkText="Conversations List" />
      <div>
        {
          status !== "failure" ?
            payload.map(({ content, role, id }) => {
              return (
                <div key={id}>
                  <h3>{role.toUpperCase()}</h3>
                  {/* Convert markdown prior to rendering */}
                  {content}
                </div>
              )
            }) :
            <p>Could not load all conversations.</p>
        }
      </div>
    </MainContent>
  )
}
