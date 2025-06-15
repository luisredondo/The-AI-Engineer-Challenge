"use client";
import React, { useEffect, useRef, useState } from "react";

// Message type
type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setIsSending(true);
    // Simulate bot response
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "This is a mock response. Integration coming soon!",
        },
      ]);
      setIsSending(false);
    }, 1200);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200/60 via-white/80 to-purple-200/60 dark:from-gray-900/70 dark:via-gray-800/80 dark:to-indigo-900/60 transition-colors duration-500">
      <div className="w-full max-w-xl flex flex-col flex-1 rounded-2xl shadow-2xl backdrop-blur-lg bg-white/70 dark:bg-gray-900/60 border border-white/30 dark:border-white/10 p-6 gap-4 relative" style={{ minHeight: 500 }}>
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-100 drop-shadow-lg select-none">Glassy Chat</h1>
        <div className="flex-1 overflow-y-auto space-y-4 py-2 custom-scrollbar" style={{ maxHeight: 350 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative px-4 py-2 rounded-2xl max-w-[75%] shadow-md transition-all duration-300 animate-fadeIn
                  ${msg.sender === "user"
                    ? "bg-gradient-to-br from-blue-400/70 to-blue-600/80 text-white self-end rounded-br-3xl"
                    : "bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 self-start rounded-bl-3xl border border-white/30 dark:border-white/10"}
                `}
                style={{
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: msg.sender === "user"
                    ? "0 4px 24px 0 rgba(0, 120, 255, 0.10)"
                    : "0 4px 24px 0 rgba(120, 120, 120, 0.10)",
                  transition: "box-shadow 0.3s cubic-bezier(.4,2,.6,1)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form
          className="flex gap-2 items-center mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/40 dark:focus:ring-blue-600/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={isSending}
            autoFocus
            style={{ backdropFilter: "blur(10px)" }}
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-2xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSending || !input.trim()}
            aria-label="Send message"
          >
            {isSending ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-blue-400 rounded-full"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l15.75-7.5-7.5 15.75-2.25-6.75-6.75-2.25z" />
              </svg>
            )}
          </button>
        </form>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.15);
          border-radius: 8px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(.4,2,.6,1);
        }
      `}</style>
    </div>
  );
}
