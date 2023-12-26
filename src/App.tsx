// App.tsx

import React, {useState} from 'react';
import './App.css';
import OpenAI from 'openai';

import {ChatContainer, MainContainer, Message, MessageInput, MessageList,} from '@chatscope/chat-ui-kit-react';

export const openai = new OpenAI({
    apiKey: "*********Insert key here!**********",
    dangerouslyAllowBrowser: true
})

const assistant = await openai.beta.assistants.create({
    instructions: "Translate all English into Japanese, and all Japanese into English.",
    model: "gpt-3.5-turbo-1106",
})

const thread = await openai.beta.threads.create()

async function waitUntilRunComplete(run: OpenAI.Beta.Threads.Runs.Run): Promise<OpenAI.Beta.Threads.Runs.Run> {
    // poll run status until it is completed
    while (run.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    return run
}

function App() {

    const [messages, setMessages] = useState<string[]>([]);

    const onSend = async (innerHtml: string, textContent: string, innerText: string, nodes: NodeList) => {
        // Add user message
        setMessages(messages.concat([textContent]))
        // Create a new message
        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: textContent
            });
        // Get a list of messages
        let run = await openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: assistant.id,
            }
        );
        await waitUntilRunComplete(run);
        let gptMessages = await openai.beta.threads.messages.list(thread.id)
        let msgText = gptMessages.data[0].content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
        setMessages(messages.concat([textContent, msgText.text.value]))
    };
    return (
        <div className="App">
            <div style={{position: "absolute", height: "500px", width: "800px"}}>
                <MainContainer responsive={true}>
                    <ChatContainer>
                        <MessageList>
                            {messages.map((message, index) => (
                                <Message
                                    model={{
                                        message: message,
                                        // Alternates between right and left
                                        direction: index % 2 === 0 ? "outgoing" : "incoming",
                                        position: "single"
                                    }}
                                    key={index}
                                />
                            ))}
                        </MessageList>
                        <MessageInput placeholder="Type message here" onSend={onSend}/>
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default App;
