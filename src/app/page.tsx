"use client";
import { SyntheticEvent, useEffect, useState } from "react";
import { chat, list } from "./brains/ollama";
import { ChatResponse, ListResponse } from "ollama";
import Markdown from "react-markdown";
import Image from "next/image";
import blinkie from "../../public/blinkiesCafe-6b.gif";
import {createConversation, createSession, getAllSessions} from "./db/query"

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [models, setModels] = useState([] as unknown as ListResponse);
  const [sessions, setSessions] = useState([])
  const [session, setSession] = useState(undefined as unknown as number)

  useEffect(() => {
    async function fetchModelList() {
      const models = await list();
      setModels(models);
    }
    fetchModelList();
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      const {status, payload}  = await getAllSessions()
      if (status == "failure") {
        console.error('Failure loading sessions')
        setSessions([])
      }
      setSessions(payload)
    }
    fetchSessions()
  }, [])

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(event?.target?.value ?? "");
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse("pending");
    const formData = new FormData(event.target as HTMLFormElement);
    const content = String(formData.get("input"));
    let model = formData.get("selectedModel");

    if (typeof model !== "string") {
      model = "deepseek-r1:1.5b";
    }

    const newQuery = { "role": "user", "content": content, "sessionId": session ?? 0};

    try {
      if (!session) {
        // Only create a new session if we are submitting a query and there is no session in state
        const sesh = await createSession()
        console.log('Status', sesh.status)
        if (sesh.status == "failure") {
          throw "Failed to save conversation"
        }
        if (sesh.session?.id) {
          newQuery.sessionId = sesh.session.id;
          setSession(sesh.session.id)
        }
      }
      const convo = await createConversation(newQuery)
      console.log(convo.status)
      if (convo.status == "failure") {
        throw "Failed to save conversation"
      }
    } catch (e) {
      console.error(e)
    }

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
    };

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

  const clearHistory = (): void => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      sessionStorage.clear();
      setResponse("");
      setReasoning("");
      setQuery("");
    }
  };

  return (
    <main className="m-auto p-2">
      <form
        id="oracleHole"
        className="grid grid-cols-1 grid-rows-2 gap-4 m-8"
        onSubmit={async (event) => {
          handleSubmit(event);
        }}
      >
        <div className="m-auto p-0">
          <label htmlFor="oracleHole">Ai WebWeb</label>
          <p className="text-xs">for to make conversation with the brains</p>
        </div>
        <div className="grid grid-cols-1 grid-rows-2">
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
          onClick={clearHistory}
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
    </main>
  );
}
