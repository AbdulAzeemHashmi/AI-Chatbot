"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Menu, 
  X, 
  Sparkles,
  Copy,
  Check,
  AlertTriangle
} from "lucide-react";

// Local SVG icon component for GitHub
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    width="15" 
    height="15" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chats from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("gemini_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved chat sessions:", e);
      }
    }
    // Initialize default session if nothing found
    const defaultSession: ChatSession = {
      id: "default-session-id",
      title: "New Chat Session",
      messages: []
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (mounted && sessions.length > 0) {
      localStorage.setItem("gemini_chats", JSON.stringify(sessions));
    }
  }, [sessions, mounted]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading]);

  // Auto-resize input textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: `Chat Session ${sessions.length + 1}`,
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
    setError(null);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const defaultSession: ChatSession = {
        id: "default-session-id",
        title: "New Chat Session",
        messages: []
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
    setError(null);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim() || isLoading || !activeSessionId) return;

    setError(null);
    if (!textToSend) setInput("");

    // Create the updated message list
    const userMessage: Message = { role: "user", content: messageContent };
    const currentMessages = activeSession ? activeSession.messages : [];
    const updatedMessages = [...currentMessages, userMessage];

    // Update state locally
    setSessions(
      sessions.map((s) => {
        if (s.id === activeSessionId) {
          // Auto rename chat session based on first message
          const newTitle = s.messages.length === 0 
            ? (messageContent.length > 25 ? `${messageContent.substring(0, 25)}...` : messageContent)
            : s.title;
          return {
            ...s,
            title: newTitle,
            messages: updatedMessages
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response from server.");
      }

      const data = await response.json();
      const modelMessage: Message = { role: "model", content: data.response };

      setSessions(
        sessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...updatedMessages, modelMessage]
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please make sure the FastAPI backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render text containing custom markdown code block formatting
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-3 leading-relaxed text-sm md:text-base">
        {parts.map((part, index) => {
          if (part.startsWith("```")) {
            const match = part.match(/```(\w*)\n([\s\S]*?)```/);
            const lang = match ? match[1] : "";
            const code = match ? match[2] : part.slice(3, -3);

            return (
              <div 
                key={index} 
                className="my-3 rounded-lg border border-zinc-800 bg-zinc-950/80 overflow-hidden font-mono text-xs md:text-sm"
              >
                <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                  <span>{lang || "code"}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(code.trim())}
                    className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer text-xs"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-zinc-300">
                  <code>{code.trim()}</code>
                </pre>
              </div>
            );
          } else {
            const lines = part.split("\n");
            return (
              <div key={index} className="space-y-1">
                {lines.map((line, lineIdx) => {
                  // List items
                  if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                    const cleanLine = line.trim().slice(2);
                    return (
                      <ul key={lineIdx} className="list-disc pl-6 space-y-0.5 my-0.5">
                        <li>{renderInlineStyles(cleanLine)}</li>
                      </ul>
                    );
                  }

                  if (line.trim() === "") {
                    return <div key={lineIdx} className="h-2" />;
                  }

                  return <p key={lineIdx}>{renderInlineStyles(line)}</p>;
                })}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-zinc-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code 
            key={idx} 
            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-purple-300 font-mono text-xs md:text-sm"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const quickPrompts = [
    { title: "Explain React Server Components", desc: "Understand how they differ from Client Components" },
    { title: "Python API template", desc: "Write a FastAPI route with query parameter filters" },
    { title: "Tailwind Glassmorphism style", desc: "Generate a custom CSS backdrop blur container" }
  ];

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <Sparkles className="animate-spin text-purple-500 mr-2" />
        <span>Loading Application...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-zinc-900 bg-zinc-950 transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-900/30">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-purple-400 bg-clip-text text-transparent">
              Gemini AI Chat
            </span>
          </div>
          <button 
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 md:hidden cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-medium text-white shadow-md shadow-indigo-900/20 transition-all hover:opacity-95 hover:shadow-indigo-900/40 active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsSidebarOpen(false);
                  setError(null);
                }}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-3 transition-all cursor-pointer ${
                  isActive 
                    ? "bg-zinc-900/80 border border-zinc-800 text-purple-400" 
                    : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={isActive ? "text-purple-400" : "text-zinc-500"} />
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </div>
                <button
                  onClick={(e) => deleteChat(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-all cursor-pointer"
                  title="Delete chat session"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Creator Credit Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
          <a
            href="https://github.com/AbdulAzeemHashmi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-zinc-500 hover:text-zinc-200 transition-colors text-xs font-mono"
          >
            <GithubIcon className="h-[15px] w-[15px]" />
            <span>AbdulAzeemHashmi</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Main Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 md:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-zinc-200 truncate max-w-[200px] md:max-w-md">
              {activeSession ? activeSession.title : "Chat"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini-Pro
            </div>
          </div>
        </header>

        {/* Message View / Chat Window */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeSession && activeSession.messages.length === 0 ? (
            /* Empty State Container */
            <div className="flex h-full flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-purple-500/30 text-purple-400 shadow-xl shadow-purple-950/10">
                <Bot size={36} className="animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  Intelligent Assistant
                </h2>
                <p className="text-sm md:text-base text-zinc-400">
                  Ask questions, format code blocks, and explore content. Start your conversation with one of the prompts below.
                </p>
              </div>
              
              {/* Quick Prompt Suggestions */}
              <div className="grid grid-cols-1 gap-3 w-full sm:grid-cols-3">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.title)}
                    className="flex flex-col items-start gap-1 text-left rounded-xl border border-zinc-900 bg-zinc-900/25 p-4 transition-all hover:border-zinc-800 hover:bg-zinc-900/60 active:scale-[0.98] cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-purple-400">{prompt.title}</span>
                    <span className="text-[11px] text-zinc-500 line-clamp-2">{prompt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message List */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeSession?.messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 flex-shrink-0">
                        <Bot size={16} />
                      </div>
                    )}
                    <div 
                      className={`relative max-w-[85%] rounded-2xl px-4 py-3 shadow-md border ${
                        isUser 
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500/30 text-white rounded-tr-none" 
                          : "bg-zinc-900/50 backdrop-blur-md border-zinc-800/80 text-zinc-200 rounded-tl-none"
                      }`}
                    >
                      {/* Copy message button */}
                      {!isUser && (
                        <button
                          onClick={() => copyToClipboard(message.content, index)}
                          className="absolute top-2.5 right-2.5 p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === index ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      )}
                      
                      <div className={!isUser ? "pr-6 group" : ""}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.content}</p>
                        ) : (
                          renderMessageContent(message.content)
                        )}
                      </div>
                    </div>
                    {isUser && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 border border-indigo-500/30 text-zinc-200 flex-shrink-0">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bot thinking skeleton indicator */}
              {isLoading && (
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-5 py-4 w-28">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Callout Banner */}
              {error && (
                <div className="flex items-start gap-3 max-w-xl mx-auto rounded-xl border border-red-950/40 bg-red-950/20 p-4 text-red-400 text-sm">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-red-300">Connection Failure</h4>
                    <p className="leading-normal">{error}</p>
                    <button 
                      onClick={() => handleSend()}
                      className="mt-2 text-xs font-semibold text-red-300 underline hover:text-red-200 cursor-pointer"
                    >
                      Retry sending last message
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Control Console */}
        <div className="border-t border-zinc-900 bg-zinc-950/40 backdrop-blur-md p-4 md:p-6">
          <div className="max-w-3xl mx-auto relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2 bg-zinc-900/40 border border-zinc-850 rounded-2xl p-2 focus-within:border-purple-500/50 transition-colors"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message to Gemini..."
                rows={1}
                disabled={isLoading}
                className="flex-1 max-h-48 resize-none bg-transparent py-2.5 px-3.5 text-sm md:text-base outline-none text-zinc-100 placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow shadow-indigo-900/35 transition-all hover:opacity-95 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-[11px] text-zinc-600 text-center mt-2.5">
              Gemini may generate inaccurate responses. Double-check important facts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
