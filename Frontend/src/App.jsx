import { useState, useRef } from "react";

import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";

import ChatMessages from "./components/chat/ChatMessages";
import ChatInput from "./components/chat/ChatInput";

function App() {
  const initialGreeting = {
    id: 1,
    role: "assistant",
    content: "Hello, I'm StudyPilot. Ask me anything about your notes or PDFs.",
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
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
    if (!input.trim() && files.length === 0) return;

    const userText = input.trim() || "Uploaded a file.";
    const sessionId = currentSessionId || createNewSession(messages);

    const userMessage = {
      id: Date.now(),
      role: "user",
      content:
        files.length > 0
          ? `${userText}\n📎 ${files.map((file) => file.name).join(", ")}`
          : userText,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      let data;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
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

      setFiles([]);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
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

      setFiles([]);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
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
    setFiles([]);
  };

  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    setFiles([]);
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
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          handleNewChat={handleNewChat}
          loadSession={loadSession}
        />

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          <ChatHeader />

          <div className="flex-1 px-4 py-8 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <ChatMessages messages={messages} loading={loading} />

              <ChatInput
                input={input}
                setInput={setInput}
                files={files}
                setFiles={setFiles}
                fileRef={fileRef}
                handleEnter={handleEnter}
                handleSend={handleSend}
                handleQuiz={handleQuiz}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
