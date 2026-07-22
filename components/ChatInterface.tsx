"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookMetadata } from "@/lib/books";
import "katex/dist/katex.min.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedBook?: BookMetadata;
}

export default function ChatInterface({ selectedBook }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm **Ottimo**, your AI learning companion 🎓\n\nI'm here to help you understand your textbook using the Socratic method — I'll guide you to discover answers yourself rather than just giving direct homework answers.\n\nAsk me anything about your textbook or a science/math topic you are exploring!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getHistoryForApi = () =>
    messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          bookId: selectedBook?.id,
          subject: selectedBook?.subject,
          gradeLevel: selectedBook?.gradeLevel,
          history: getHistoryForApi(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to reach Ottimo AI server");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream received");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") break;

          try {
            const { text: chunkText } = JSON.parse(dataStr);
            if (chunkText) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + chunkText }
                    : m
                )
              );
            }
          } catch {
            // Ignore parse errors on SSE buffer chunks
          }
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `⚠️ *${errMsg}. Please try again.*` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header banner */}
      <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Ottimo Socratic Guide</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300">
                Groq AI · Llama 3.3
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {selectedBook ? (
                <>Grounded in <span className="text-teal-300">{selectedBook.title}</span> ({selectedBook.subject})</>
              ) : (
                "Socratic learning companion"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs mt-0.5",
                m.role === "user"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-gradient-to-br from-teal-500 to-cyan-600"
              )}
            >
              {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={cn(
                "p-4 rounded-2xl text-xs leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-purple-500/10"
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
              )}
            >
              {m.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    code: ({ children }) => (
                      <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[11px] text-teal-300">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {m.content || (isStreaming ? "Thinking..." : "")}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-black/40 border-t border-white/10 flex-shrink-0">
        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-teal-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedBook
                ? `Ask Ottimo about ${selectedBook.title}...`
                : "Ask Ottimo a question..."
            }
            rows={1}
            className="flex-1 bg-transparent border-0 resize-none text-xs text-white placeholder-gray-500 focus:outline-none max-h-32 p-1.5"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
