"use client";
import React, { useRef, useState, useEffect } from "react";
import api from "@/lib/api";

type Message = {
  _id?: string;
  userId: string;
  username: string;
  message: string;
  createdAt?: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/chat/global");
      setMessages(response.data.data);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const tempInput = input;
    setInput("");

    try {
      await api.post("/chat/global", { message: tempInput });
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Are you logged in?");
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col  bg-white border-4 border-[#EBEBF3] rounded-r-3xl h-full my-2 pb-3 ">
      <h1 className="text-center bg-slate-400/10 p-2 rounded-t-xl  text-gray-700 font-semibold mb-4 ">
        Global Chat
      </h1>
      <div
        className="flex-1 flex flex-col gap-1 overflow-y-auto pb-4 px-2"
        ref={chatContainerRef}
      >
        {messages.map((msg, idx) => {
          return (
            <div key={msg._id || idx} className="flex flex-col items-start gap-1">
              <span className="text-[10px] text-gray-400 ml-2">{msg.username}</span>
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-sm">
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="flex items-center mt-4 bg-gray-50 rounded-full mx-3 px-3 py-2 border border-gray-200"
        onSubmit={handleSend}
      >
        <input
          type="text"
          className="flex-1 bg-transparent outline-none px-2  text-gray-700"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 text-gray-400 disabled:opacity-40"
          disabled={!input.trim()}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
