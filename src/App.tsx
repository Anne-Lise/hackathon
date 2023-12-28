// App.tsx

import React, { useEffect, useState } from "react";
import "./App.css";
import OpenAI from "openai";
import "./style.css";

const personaInput = {
  PersonName: "Tanaka",
  Age: 21,
  Gender: { male: "23%", female: "77%" },
  Income: "100000 JPY",
  Languages: ["English", "Japanese"],
  Occupations: ["Student", "Part-time cook"],
  MaritalStatus: "Single",
};

const surveyData = [
  {
    project: "project1",
    question: "What is your age",
    answers: ["25", "25", "45"],
  },
  {
    project: "project2",
    question: "What is favorite language",
    answers: ["English", "French", "German", "German", "French"],
  },
];

export const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [personaOutput, setPersonaOutput] = useState(
    JSON.stringify(personaInput),
  );
  const [updatePersona, setUpdatePersona] = useState(false);
  const [displayOutput, setDisplayOutput] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [surveyToAnalyse, setSurveyToAnalyse] = useState({});
  useEffect(() => {
    if (updatePersona) {
      console.log("call to openai");
      const completion = async () => {
        const response = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Based on a variable named surveyData, generate an updated persona from the one given in the variable named personaInput :
Replace the existing value of the personaInput fields with a new value when possible.
The new value will be computed from an analysis of surveyData.
One field can have several values, for example "Occupations" can have "teacher" and "part-time job" as values.
You are not allowed to change values of fields that are outside the scope of the survey question.

Example:
  You have surveyData as follows: 
  {
    project: "project1",
    question: "What is your age",
    answers: ["25", "25", "45"],
  }
  As the question is about the age of the people answering, you can update the "Age" field in the persona.
  Its value could be calculated based on the average of all answers.

Another example:
  You have surveyData as follows: 
  {
    project: "project2",
    question: "What is favorite language",
    answers: ["English", "French", "German", "German", "French"],
  }
  As the question is about the language of the people answering, you can update the "Languages" field in the persona.
  Its values could be the ones that are the most represented in the answers.

For the format, render it as an object with the same structure as personaInput.

Here are the two variables:
  personaInput: "${JSON.stringify(personaInput)}"

  surveyData: "${JSON.stringify(surveyToAnalyse)}"`,
            },
          ],
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
  const personaData = JSON.parse(personaOutput);

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
            {Object.entries(personaInput).map(([key, value]) => {
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
                {surveyData
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
                setSurveyToAnalyse(surveyData[0]);
              }}
            >
              Check AI suggestion
            </button>
          </div>
          <div className="survey-card">
            <div>SURVEY #2 RESULTS</div>
            <div>
              <div className="survey-question">
                {surveyData
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
                setSurveyToAnalyse(surveyData[1]);
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
              <div>
                {Object.entries(personaData).map(([key, value]) => {
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
