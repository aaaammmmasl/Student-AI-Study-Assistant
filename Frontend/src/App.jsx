import { useState, useRef } from "react";
import {
  Sparkles,
  Plus,
  History as HistoryIcon,
  Send,
  Paperclip,
  Brain,
} from "lucide-react";

function App() {
  const initialGreeting = {
    id: 1,
    role: "assistant",
    content: "Hello, I'm StudyPilot. Ask me anything about your notes or PDFs.",
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const fileRef = useRef(null);

  const createNewSession = (startMessages = [initialGreeting]) => {
    const newSession = {
      id: Date.now(),
      title: "New Session",
      messages: startMessages,
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(startMessages);
    return newSession.id;
  };

  const syncSessionMessages = (sessionId, nextMessages) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: nextMessages,
              title:
                session.title === "New Session" && nextMessages.length > 1
                  ? nextMessages[1]?.content?.slice(0, 28) || session.title
                  : session.title,
            }
          : session,
      ),
    );
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const userText = input.trim() || "Uploaded a file.";
    const sessionId = currentSessionId || createNewSession(messages);

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: file ? `${userText}\n📎 ${file.name}` : userText,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      let data;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("message", userText);
        formData.append("messages", JSON.stringify(updatedMessages));

        const res = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          body: formData,
        });

        data = await res.json();
      } else {
        const res = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userText,
            messages: updatedMessages,
          }),
        });

        data = await res.json();
      }

      const reply = data.reply || "No response.";

      const finalMessages = [
        ...updatedMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
        },
      ];

      setMessages(finalMessages);
      syncSessionMessages(sessionId, finalMessages);
      setFile(null);
    } catch (error) {
      console.log(error);

      const errorMessages = [
        ...updatedMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Cannot connect with server.",
        },
      ];

      setMessages(errorMessages);
      syncSessionMessages(sessionId, errorMessages);
    }

    setLoading(false);
  };

  const handleQuiz = () => {
    const lastAssistant = [...messages]
      .reverse()
      .find((msg) => msg.role === "assistant");

    if (!lastAssistant) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "assistant",
        content: "Quiz feature coming soon based on latest response.",
      },
    ]);
  };

  const handleNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: "New Session",
      messages: [initialGreeting],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([initialGreeting]);
    setInput("");
    setFile(null);
  };

  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    setFile(null);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-white">
      <div className="flex h-full w-full">
        <aside className="hidden h-full w-80 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-zinc-900 md:flex">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400 text-black">
                <Sparkles size={18} />
              </div>

              <div>
                <h1 className="text-lg font-semibold">StudyPilot</h1>
                <p className="text-xs text-zinc-400">AI Study Assistant</p>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 p-4">
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-sm font-medium hover:bg-zinc-700"
            >
              <Plus size={16} />
              New Session
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 pb-2 pt-4 text-sm text-zinc-400">
            <HistoryIcon size={16} />
            Recent Activity
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {sessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/50 px-4 py-6 text-sm text-zinc-500">
                No sessions yet.
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={`mb-3 w-full rounded-3xl border px-4 py-4 text-left transition ${
                    currentSessionId === session.id
                      ? "border-lime-400/30 bg-lime-400/10"
                      : "border-white/10 bg-zinc-950/50 hover:border-lime-400/20 hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-100">
                    {session.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                    {session.messages?.[1]?.content || "Conversation session"}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="border-b border-white/10 px-8 py-5">
            <h2 className="text-xl font-semibold">StudyPilot Chat</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Summarize notes, analyze PDFs, and prepare quizzes.
            </p>
          </header>

          <div className="flex-1 px-4 py-8 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-7 ${
                        msg.role === "user"
                          ? "bg-lime-400 text-black"
                          : "border border-white/10 bg-zinc-900 text-zinc-100"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-3xl border border-white/10 bg-zinc-900 px-5 py-4 text-sm text-zinc-400">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-900 p-4">
                {file && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-xs text-zinc-300">
                    <Paperclip size={14} />
                    {file.name}
                    <button
                      onClick={() => setFile(null)}
                      className="ml-1 text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleEnter}
                  placeholder="Ask StudyPilot anything..."
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      hidden
                      onChange={(e) => setFile(e.target.files[0] || null)}
                    />

                    <button
                      onClick={() => fileRef.current.click()}
                      className="rounded-xl bg-zinc-800 p-3 hover:bg-zinc-700"
                    >
                      <Paperclip size={18} />
                    </button>

                    <button
                      onClick={handleQuiz}
                      className="rounded-xl bg-zinc-800 p-3 hover:bg-zinc-700"
                    >
                      <Brain size={18} />
                    </button>
                  </div>

                  <button
                    onClick={handleSend}
                    className="inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:bg-lime-300"
                  >
                    <Send size={16} />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
