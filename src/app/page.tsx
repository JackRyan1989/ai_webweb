"use client";
import { SetStateAction, SyntheticEvent, useEffect, useState} from "react";
import {chat, list} from "./brains/ollama";
import {ChatResponse, ListResponse} from "ollama";
import Markdown from "react-markdown";
import Image from "next/image";
import blinkie from "../../public/blinkiesCafe-6b.gif";
import SessionDisplay from "./components/sessionsDisplay";
import {createConversation, createSession, getAllSessions} from "./db/query"
import { Query } from "./db/types";

function separateReasoning(response: string) {
  return response.split("</think>");
}

function renderReasoning(reasoning: string) {
  return (
      <details>
        <summary>Rationale</summary>
        {reasoning.replaceAll("<think>", "")}
      </details>
  );
}

function renderResponse(reasoning: string, response: string) {
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

async function fetchModelList(modelSetter: (arg: ListResponse) => void) {
  const models = await list();
  modelSetter(models);
}

async function fetchSessions(sessionSetter: (arg: any) => void) {
  const {status, payload} = await getAllSessions()
  if (status == "failure") {
    console.error('Failure loading sessions')
    sessionSetter([])
  }
  sessionSetter(payload)
}

interface SessionSetter {
  (value: React.SetStateAction<number | null>): void;
  (arg0: (number | null)): void;
}

// Should only happen on page load when we are synchronizing to our database
async function initializeSession({sessionState, sessionSetter}: { sessionState: number | null, sessionSetter: SessionSetter }) {
  try {
    if (sessionState == null) {
      const sesh = await createSession()
      console.log('Status', sesh.status)
      // Set current session id in state
      if (sesh.session?.id) {
        sessionSetter(sesh.session.id)
      }
    }
  } catch {
    throw new Error("Failed to initialize new session")
  }
}

async function saveConversation(query: Query) {
  try {
    const convo = await createConversation(query)
    console.log(convo.status)
    if (convo.status == "failure") {
      throw "Failed to save conversation"
    }
  } catch {
    throw new Error('Could not initialize conversation.')
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [models, setModels] = useState([] as unknown as ListResponse);
  const [sessions, setSessions] = useState([])
  const [session, setSession] = useState(null as unknown as number | null)

// This is what we want done on page load
  useEffect(() => {
    fetchModelList(setModels);
    fetchSessions(setSessions);
    initializeSession({sessionState : session, sessionSetter : setSession})
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(event?.target?.value ?? "");
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse("pending");
    const formData = new FormData(event.target as HTMLFormElement);
    const content = String(formData.get("input"));
    let model = formData.get("selectedModel");

    if (typeof model != "string") {
      model = "deepseek-r1:1.5b";
    }

    const newQuery = { "role": "user", "content": content, "sessionId": session, model: model };
    // Create user statement
    saveConversation(newQuery)

    if (sessionStorage.getItem("history")) {
      const oldHistory = JSON.parse(sessionStorage.getItem("history") ?? "[]");
      oldHistory.push(newQuery);
      const newHistory = JSON.stringify(oldHistory);
      sessionStorage.setItem("history", newHistory);
    } else {
      sessionStorage.setItem("history", `[${JSON.stringify(newQuery)}]`);
    }

    const chatResponse = await chat(
      JSON.parse(sessionStorage.getItem("history") ?? "[]") as unknown as [],
      model,
    );

    const newResponse = {
      "role": "assistant",
      "content": (chatResponse as ChatResponse).message.content,
      "sessionId": session,
      model: model
    };

    // Create model response statement
    saveConversation(newResponse)

    const oldHistory = JSON.parse(sessionStorage.getItem("history") ?? "[]");
    oldHistory.push(newResponse);
    const newHistory = JSON.stringify(oldHistory);
    sessionStorage.setItem("history", newHistory);

    if (model == "deepseek-r1:1.5b") {
      const [responseReasoning, responseContent] = separateReasoning(
        chatResponse.message.content,
      );
      setReasoning(responseReasoning);
      setResponse(responseContent);
    } else {
      setReasoning("");
      setResponse(chatResponse.message.content);
    }
  };

  const createNewSession = (): void => {
    if (confirm("Are you sure you want to create a new session?")) {
      sessionStorage.clear();
      setResponse("");
      setReasoning("");
      setQuery("");
      setSession(null);
      initializeSession({sessionState : session, sessionSetter : setSession})
      fetchSessions(setSessions)
    }
  };

  console.log(sessions)

  return (
    <main className="m-auto grid grid-cols-12 grid-rows-1 gap-1 max-w-screen">
      <aside className="sticky col-span-2 left-0 bg-white border-r-2 border-black">{Object.keys(sessions)}</aside>
      <div className="col-span-10">
      <form
        id="oracleHole"
        className="flex flex-col content-center gap-4 m-8"
        onSubmit={async (event) => {
          await handleSubmit(event);
        }}
      >
        <div className="m-auto p-0">
          <label htmlFor="oracleHole">Ai WebWeb</label>
          <p className="text-xs">for to make conversation with the brains</p>
        </div>
        <div className="flex flex-col">
          <label className="text-xs m-0 h-min" htmlFor="modelSelect">
            Select brain
          </label>
          <select
            name="selectedModel"
            id="modelSelect"
            className="w-min p-0 m-0"
          >
            {models.models?.length > 0
              ? models?.models.map((model) => {
                return (
                  <option key={model.model} value={model.model}>
                    {model.name}
                  </option>
                );
              })
              : null}
          </select>
        </div>
        <textarea
          className="border-2 rounded p-2"
          id="input"
          name="input"
          rows={7}
          cols={33}
          value={query}
          onChange={(event) => handleInput(event)}
          minLength={1}
          required={true}
        >
        </textarea>
        <button
          className="m-auto bg-black border-black border-2 text-amber-50 p-2 w-max rounded hover:bg-white hover:text-black focus:bg-white focus:text-black "
          type="submit"
        >
          Talk to me
        </button>
        <button
          onClick={createNewSession}
          className="m-auto bg-black border-black border-2 text-amber-50 p-2 w-max rounded hover:bg-white hover:text-black focus:bg-white focus:text-black"
          type="button"
        >
          Clear History
        </button>
      </form>
      <section aria-labelledby="output" className="m-8 p-2">
        <h2 id="output" className="sr-only">Output</h2>
        <div id="outputContainer">
          {renderResponse(reasoning, response)}
        </div>
      </section>
      </div>
    </main>
  );
}
