import { useState, useRef } from "react";
import { sendChatRequest } from "../services/chatApi";

const initialGreeting = {
  id: 1,
  role: "assistant",
  content: "Hello, I'm StudyPilot. Ask me anything.",
};

export function useChatStore() {
  // ========================
  //  STATE
  // ========================
  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const fileRef = useRef(null);

  // ========================
  //  CORE LOGIC
  // ========================

  const createSession = (startMessages = [initialGreeting]) => {
    const session = {
      id: Date.now(),
      title: "New Session",
      messages: startMessages,
    };

    setSessions((prev) => [session, ...prev]);
    setCurrentSessionId(session.id);
    setMessages(startMessages);

    return session.id;
  };

  const syncSession = (sessionId, nextMessages) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;

        return {
          ...s,
          messages: nextMessages,

          // عنوان ذكي للجلسة
          title:
            s.title === "New Session" && nextMessages.length > 1
              ? nextMessages[1]?.content?.slice(0, 30)
              : s.title,
        };
      }),
    );
  };

  const buildUserMessage = (text) => {
    if (files.length === 0) {
      return {
        id: Date.now(),
        role: "user",
        content: text,
      };
    }

    return {
      id: Date.now(),
      role: "user",
      content: `${text}\n📎 ${files.map((f) => f.name).join(", ")}`,
    };
  };

  const resetInputState = () => {
    setInput("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ========================
  //  ACTIONS UI
  // ========================

  const handleNewChat = () => {
    createSession([initialGreeting]);
    resetInputState();
  };

  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    resetInputState();
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const text = input.trim() || "Uploaded file.";
    const sessionId = currentSessionId || createSession(messages);

    const userMessage = buildUserMessage(text);

    const updated = [...messages, userMessage];

    setMessages(updated);
    setLoading(true);
    resetInputState();

    try {
      // نحصل على الرد كامل أولاً
      const data = await sendChatRequest({
        message: text,
        messages: updated,
        files,
      });

      const replyText = data.reply || "No response.";

      // 👇 هنا السحر: typing effect
      await streamAssistantMessage(replyText, sessionId);

      syncSession(sessionId, updated);
    } catch (err) {
      console.log(err);

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Server error. Please try again.",
      };

      const finalMessages = [...updated, errorMessage];

      setMessages(finalMessages);
      syncSession(sessionId, finalMessages);
    }

    setLoading(false);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const streamAssistantMessage = async (fullText) => {
    const id = crypto.randomUUID();

    let displayed = "";

    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);

    const chunks = fullText.split(/(?<=[.!?])\s+/);

    for (let i = 0; i < chunks.length; i++) {
      displayed += (i === 0 ? "" : " ") + chunks[i];

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: displayed } : m)),
      );

      await sleep(250 + Math.random() * 200);
    }
  };

  const handleQuiz = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");

    if (!last) return;

    const quizMessage = {
      id: Date.now(),
      role: "assistant",
      content: "📚 Quiz feature coming soon based on this context.",
    };

    setMessages((prev) => [...prev, quizMessage]);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  // ========================
  //  RENAME & EDITE SESSION
  // ========================

  const renameSession = (id, newTitle) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, title: newTitle || "Untitled Session" }
          : session,
      ),
    );
  };

  const deleteSession = (id) => {
    const filtered = sessions.filter((session) => session.id !== id);

    setSessions(filtered);

    if (currentSessionId === id) {
      if (filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        setCurrentSessionId(null);
        setMessages([initialGreeting]);
      }
    }
  };

  // ========================
  //  EXPORT
  // ========================

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
    renameSession,
    deleteSession,
    handleSend,
    handleNewChat,
    loadSession,
    handleQuiz,
    handleEnter,
  };
}
