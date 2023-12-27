// App.tsx

import React, { useEffect, useState } from "react";
import "./App.css";
import OpenAI from "openai";
import "./style.css";

import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
} from "@chatscope/chat-ui-kit-react";
import { compileFunction } from "vm";

const personaInput = {
  personName: "Tanaka",
  averageAge: 21,
  gender: { male: "23%", female: "77%" },
  averageIncome: 100000,
  mainLanguages: ["English", "Japanese"],
  mainOccupations: ["Student", "Part-time cook"],
  maritalStatus: "Single",
};

const surveyTemplate = {
  question: "What is your favorite color?",
  possibleAnswers: ["Red", "Green", "Blue"],
};
const surveyResults = { answers: ["Red", "Red", "Blue"] };


export const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [personaOutput, setPersonaOutput] = useState(
    JSON.stringify(personaInput),
  );
  const [promptInput, setPromptInput] = useState("");
  const [updatePersona, setUpdatePersona] = useState(false);

  useEffect(() => {
    if (updatePersona) {
      console.log("call to openai");

      const assistantWrapper = async () => {
        const assistant = await openai.beta.assistants.create({
          instructions: `
You are a persona assistant.

Based on these survey results:
    Here is the survey template :
        Question: "what is your favorite animal?"
        Possible answers: cat, dog, mouse
    Here are the survey answers : [cat, cat, mouse]

Could you please update the persona definition that follows?
`
,
          model: "gpt-3.5-turbo-1106",
        })

        // Here is a persona definition: "${JSON.stringify(personaInput)}".
        const thread = await openai.beta.threads.create()

        const message = await openai.beta.threads.messages.create(
          thread.id,
          {
            role: "user",
            content: `Here is the persona definition: "${JSON.stringify(personaInput)}".`,
          }
        )

        let run = await openai.beta.threads.runs.create(
          thread.id,
          {
            assistant_id: assistant.id,
          }
        )

        // poll run status until it is completed
        while (run.status !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        let messages = await openai.beta.threads.messages.list(thread.id);
        console.log(messages.data.length)
        console.log(messages.data[0].content[0])

        return null
      }

      //text: Object { value: "It seems like you have provided a persona
      //definition for a person named Tanaka. This persona indicates that
      //Tanaka is 21 years old, primarily speaks English and Japanese, and has
      //occupations as a student and a part-time cook. The persona also
      //indicates that Tanaka's gender distribution is 23% male and 77% female,
      //and that they are single.\n\nIf you have any specific questions or if
      //there's anything else you'd like to know about this persona, feel free
      //to ask!", annotations: [] }
      assistantWrapper();

    }
  }, [updatePersona]);

  return (
    <div className="container">
      <div className="card-container">
        <div className="persona-card">
          <img
            className="avatar"
            src="/images/avatar.png"
            alt="persona avatar"
          />
          <div>
            {" "}
            {Object.entries(JSON.parse(personaOutput)).map(([key, value]) => {
              let displayValue: string;
              if (typeof value === "object" && value !== null) {
                displayValue = Object.entries(value)
                  .map(([innerKey, innerValue]) => `${innerValue}`)
                  .join(", ");
              } else {
                displayValue = value as string;
              }
              return (
                <div key={key} className="persona-output-row">
                  <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                  {displayValue}
                </div>
              );
            })}
          </div>

          {/*<div className="survey-question">{surveyTemplate.question}</div>*/}
          {/*<div className="survey-answers">{surveyTemplate.possibleAnswers}</div>*/}
        </div>
        <div className="input-card">
          <span>Here is a persona definition:</span>
          <textarea
            className="prompt-input"
            value={promptInput}
            onChange={(e) => {
              setPromptInput(e.target.value);
            }}
            placeholder="continue the prompt"
          ></textarea>
        </div>
      </div>
      <button
        className="update-button"
        onClick={() => {
          console.log("here");
          setUpdatePersona(true);
        }}
      >
        Update
      </button>
    </div>
  );
}

export default App;
