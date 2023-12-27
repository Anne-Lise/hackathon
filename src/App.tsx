// App.tsx

import React, { useEffect, useState } from "react";
import "./App.css";
import OpenAI from "openai";
import "./style.css";

const personaInput = {
  Persona: {
    personName: "Tanaka",
    Age: 21,
    Gender: { male: "23%", female: "77%" },
    Income: 100000,
    Languages: ["English", "Japanese"],
    Occupations: ["Student", "Part-time cook"],
    MaritalStatus: "Single",
  },
  Summary: "",
};

const surveyQuestion = [
  {
    project: "project1",
    question: "What is your age",
    answers: ["25", "25", "45"],
  },
  {
    project: "project2",
    question: "What is favorite language",
    answers: ["english", "french", "japanese", "japanese"],
  },
];
// const surveyAnswers1 = ["25", "25", "45"];

export const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [personaOutput, setPersonaOutput] = useState(
    JSON.stringify(personaInput),
  );
  // const [promptInput, setPromptInput] = useState("");
  const [updatePersona, setUpdatePersona] = useState(false);
  const [displayOutput, setDisplayOutput] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  useEffect(() => {
    if (updatePersona) {
      console.log("call to openai");
      const completion = async () => {
        const response = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Based on personaInput and surveyQuestion, in a first step, generate a average persona : Replace the existing value of the personaInput Persona field with the average value when possible. One field can have several values like occupations can be teacher and part-time job but age should be an average of all ages.
              In a second step,if questions or answers from the surveyQuestion do not match the personaInput, summarize it in a short summary (2 sentences) explaining the main character of this average persona and add it to the Summary field of personaInput.
              For the format, render is as follow: 
              {Persona: {...}
              Summary: {...}
              }
              Use the following variables to do step 1 and step 2 : 
            "${JSON.stringify(personaInput)}", 
            
            "${JSON.stringify(surveyQuestion)}"`,
            },
          ],
          // messages: [{ role: "system", content: `You are a persona assistant. Based on the question and possible answers like ${surveyTemplate}, and result answers ${surveyResults},update the persona profile ${personaInput}` }],
          model: "gpt-3.5-turbo-0613",
        });
        console.log("personaOutput", response.choices[0].message.content);
        if (response && response.choices[0].message.content) {
          setIsUpdated(true);
          setPersonaOutput(response.choices[0].message.content);
        }
      };
      completion();
    }
  }, [updatePersona]);
  //   useEffect(() => {
  //     if (updatePersona) {
  //       console.log("call to openai");
  //
  //       const assistantWrapper = async () => {
  //         const assistant = await openai.beta.assistants.create({
  //           instructions: `
  //
  //           Based on personalInput and surveyQuestion and surveyAnswers, what is the average persona ? Replace the existing personInput value with average value.
  //
  //
  //
  // `,
  //           model: "gpt-3.5-turbo-1106",
  //         });
  //
  //         // Here is a persona definition: "${JSON.stringify(personaInput)}".
  //         const thread = await openai.beta.threads.create();
  //
  //         const message = await openai.beta.threads.messages.create(thread.id, {
  //           role: "user",
  //           content: `personaInput: "${JSON.stringify(personaInput)}"
  //
  //           surveyAnswers: "${JSON.stringify(surveyAnswers)}"
  //
  //           surveyQuestion: "${JSON.stringify(surveyQuestion)}"`,
  //         });
  //
  //         let run = await openai.beta.threads.runs.create(thread.id, {
  //           assistant_id: assistant.id,
  //         });
  //
  //         // poll run status until it is completed
  //         while (run.status !== "completed") {
  //           await new Promise((resolve) => setTimeout(resolve, 1000));
  //           run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  //         }
  //
  //         let messages = await openai.beta.threads.messages.list(thread.id);
  //         console.log("output", messages.data.length);
  //         console.log(messages.data[0].content[0]);
  //         if (messages && messages.data[0].content[0]) {
  //           setPersonaOutput(JSON.stringify(messages.data[0].content[0]));
  //         }
  //         return null;
  //       };
  //
  //       assistantWrapper();
  //     }
  //   }, [updatePersona]);
  const personaData = JSON.parse(personaOutput);
  const persona = personaData.Persona;
  const summary = personaData.Summary;

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
            {Object.entries(persona).map(([key, value]) => {
              let displayValue = "";
              if (typeof value === "object" && value !== null) {
                displayValue = Object.entries(value)
                  .map(([innerKey, innerValue]) => `${innerKey}: ${innerValue}`)
                  .join(", ");
              } else {
                displayValue = String(value);
              }
              return (
                <div key={key} className="persona-output-row">
                  <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                  {displayValue}
                </div>
              );
            })}
          </div>
        </div>
        <div className="survey-wrapper">
          <div className="survey-card">
            <div>SURVEY #1 RESULTS</div>
            <div>
              <div className="survey-question">
                {surveyQuestion
                  .filter((item) => item.project === "project1")
                  .map((item) => {
                    const answers = item.answers
                      .map((answer) => `<li>${answer}</li>`)
                      .join("");
                    return (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `<h3>${item.question}</h3><ul>${answers}</ul>`,
                        }}
                      />
                    );
                  })}
              </div>
            </div>
            <button
              className="card-button"
              onClick={() => {
                console.log("here1");
                setUpdatePersona(true);
                setDisplayOutput(true);
              }}
            >
              Check AI suggestion
            </button>
          </div>
          <div className="survey-card">
            <div>SURVEY #2 RESULTS</div>
            <div>
              <div className="survey-question">
                {surveyQuestion
                  .filter((item) => item.project === "project2")
                  .map((item) => {
                    const answers = item.answers
                      .map((answer) => `<li>${answer}</li>`)
                      .join("");
                    return (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `<h3>${item.question}</h3><ul>${answers}</ul>`,
                        }}
                      />
                    );
                  })}
              </div>
            </div>
            <button
              className="card-button"
              onClick={() => {
                console.log("here2");
                setUpdatePersona(true);
                setDisplayOutput(true);
              }}
            >
              Check AI suggestion
            </button>
          </div>
        </div>
        <div className="output-card">
          <div>Customized Persona</div>
          <div>
            {displayOutput && isUpdated && (
              <div className="output-content-wrapper">{summary}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
