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
Using the OpenAI API, develop an assistant tasked with updating a given persona
based on new input data. The initial persona is defined by a set of attributes
(e.g., age, gender, occupation), provided in a variable called
'currentPersona'. New input data, provided in 'newInputData', may include
additional or updated attributes. The assistant's role is to integrate
'newInputData' into 'currentPersona'. If 'newInputData' contains fields not
present in 'currentPersona', the assistant should add these as new categories
to the persona. The updated persona should reflect both the original and new
attributes, providing a comprehensive and updated profile. Example Scenario:
The current persona, 'Tanaka', has attributes like age, gender, and occupation.
The assistant receives 'newInputData' asking, 'What do you think about the new
coat?' If 'newInputData' reveals an interest in fashion or specific style
preferences not previously noted in 'Tanaka's' profile, the assistant should
update 'Tanaka's' persona with this new category, like 'Fashion Preferences,'
and incorporate insights from the response into this
category.




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
