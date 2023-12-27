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

export const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
// const assistant = await openai.beta.assistants.create({
//     instructions: "Translate all English into Japanese, and all Japanese into English.",
//     model: "gpt-3.5-turbo-1106",
// })
//
// const thread = await openai.beta.threads.create()

// async function waitUntilRunComplete(run: OpenAI.Beta.Threads.Runs.Run): Promise<OpenAI.Beta.Threads.Runs.Run> {
//     // poll run status until it is completed
//     while (run.status !== "completed") {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
//     }
//     return run
// }
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

function App() {
  const [personaOutput, setPersonaOutput] = useState(
    JSON.stringify(personaInput),
  );
  const [promptInput, setPromptInput] = useState("");
  const [updatePersona, setUpdatePersona] = useState(false);

  useEffect(() => {
    if (updatePersona) {
      console.log("call to openai");

      const completion = async () => {
        const response = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Here is a persona definition: "${JSON.stringify(
                personaInput,
              )}". ${promptInput}`,
            },
          ],
          // messages: [{ role: "system", content: `You are a persona assistant. Based on the question and possible answers like ${surveyTemplate}, and result answers ${surveyResults},update the persona profile ${personaInput}` }],
          model: "gpt-3.5-turbo-0613",
        });
        console.log(response.choices[0].message.content);
        if (response && response.choices[0].message.content) {
          setPersonaOutput(response.choices[0].message.content);
        }
      };
      completion();
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
