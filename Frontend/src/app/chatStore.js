import { useState, useRef } from "react";
import { sendChatRequest } from "../services/chatApi";

const initialGreeting = {
  id: 1,
  role: "assistant",
  content: "Hello, I'm StudyPilot.",
};

export function useChatStore() {
  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const fileRef = useRef(null);

  // create session
  const createNewSession = (start = [initialGreeting]) => {
    const newSession = {
      id: Date.now(),
      title: "New Session",
      messages: start,
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(start);

    return newSession.id;
  };
  //  create new session from the button
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
  // sync history
  const syncSession = (id, msgs) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              messages: msgs,
              title:
                s.title === "New Session"
                  ? msgs[1]?.content?.slice(0, 28)
                  : s.title,
            }
          : s,
      ),
    );
  };
  // choose between sessions
  
  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    setFiles([]);
  };

  // send message
  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const text = input.trim() || "Uploaded file.";
    const sessionId = currentSessionId || createNewSession(messages);

    const userMessage = {
      id: Date.now(),
      role: "user",
      content:
        files.length > 0
          ? `${text}\n📎 ${files.map((f) => f.name).join(", ")}`
          : text,
    };

    const updated = [...messages, userMessage];

    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatRequest({
        message: text,
        messages: updated,
        files,
      });

      const reply = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
      };

      const final = [...updated, reply];

      setMessages(final);
      syncSession(sessionId, final);

      setFiles([]);
      fileRef.current.value = "";
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return {
    // state
    messages,
    input,
    files,
    loading,
    sessions,
    currentSessionId,

    // setters
    setInput,
    setFiles,

    // refs
    fileRef,

    // actions
    handleSend,
    handleNewChat,
    loadSession,
    createNewSession,
    syncSession,
    setSessions,
    setCurrentSessionId,
  };
}
