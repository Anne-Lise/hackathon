import React from 'react';
import './App.css';
import OpenAI from "openai";

function App() {


  const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_KEY ,  dangerouslyAllowBrowser: true});

  async function main() {

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "gpt-3.5-turbo",
    });
    console.log("COMPLETION", completion.choices[0]);
  }
   main();

  async function assistant() {
    const myAssistant = await openai.beta.assistants.create({
      instructions:
          "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
      name: "Math Tutor",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4",
    });

    console.log("ASSISTANT", myAssistant);
  }
  assistant();

  async function thread() {
    const threadMessages = await openai.beta.threads.messages.create(
        "thread_abc123", // Thread ID
        { role: "user", content: "How does AI work? Explain it in simple terms." }
    );
    console.log("thread",threadMessages);
  }

  thread();

  async function run() {
    const run = await openai.beta.threads.runs.create(
        "thread_abc123", // Thread ID
        { assistant_id: "asst_abc123" } // Assistant ID
    );

    console.log("RUN",run);
  }
  run();

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => {console.log("has been clicked")}}>Click here</button>
      </header>
    </div>
  );
}

export default App;
