import { getAllConversationsForASession } from '../../db/query'
import Header from "../../components/header";
import MainContent from "../../components/mainContent";
import Markdown from "react-markdown";

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
                  <h3 className='underline decoration-1 underline-offset-4'>{role.toUpperCase()}</h3>
                  <Markdown>{content}</Markdown>
                </div>
              )
            }) :
            <p>Could not load all conversations.</p>
        }
      </div>
    </MainContent>
  )
}
