import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import "/src/index.css"; 

type Message = {
  role: "user" | "agent";
  content: string;
};

const API_URL =
  "Your API KEY";

const headers = {
  "Content-Type": "application/json",
  "x-mastra-dev-playground": "true",
};


const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const payload = {
      messages: [userMessage],
      runId: "weatherAgent",
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
      threadId: 2,
      resourceId: "weatherAgent",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) throw new Error("API call failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let collectedChunks: string[] = [];

      const agentMessage: Message = { role: "agent", content: "" };
      setMessages((prev) => [...prev, agentMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (let line of lines) {
          const match = line.match(/0:\"(.*?)\"/);
          if (match) collectedChunks.push(match[1]);
        }

        const cleaned = collectedChunks.join("").replace(/\\n/g, "\n").trim();

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "agent", content: cleaned };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "⚠️ Error fetching response!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

return (
  <div>
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message-row ${msg.role === "user" ? "user" : "agent"}`}
        >
          <div className={`message-bubble ${msg.role}`}>
            {msg.content}
          </div>
        </div>
      ))}
      {loading && (
        <div className="typing-indicator">Agent is typing...</div>
      )}
      <div ref={chatEndRef} />
    </div>

    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <input
          className="chat-input"
          placeholder="Ask something about the weather..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          size="icon"
          className="chat-send-button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          <SendHorizonal size={18} />
        </Button>
      </div>
    </div>
  </div>
);
};

export default ChatBox;
