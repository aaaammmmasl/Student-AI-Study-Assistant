import { useState, useRef, useEffect } from "react";
import { sendChatRequest } from "../services/chatApi";

const API_URL = import.meta.env.VITE_API_URL;

const initialGreeting = {
  id: 1,
  role: "assistant",
  content: "Hello, I'm StudyPilot. Ask me anything.",
};

function getStoredSessions() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("studypilot_sessions");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getStoredCurrentSessionId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("studypilot_current_session");
}

export function useChatStore() {
  const storedSessions = getStoredSessions();
  const storedCurrentId = getStoredCurrentSessionId();

  const activeSession =
    storedSessions.find((s) => s.id === storedCurrentId) ||
    storedSessions[0] ||
    null;

  const [messages, setMessages] = useState(
    activeSession?.messages || [initialGreeting],
  );
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState(storedSessions);
  const [currentSessionId, setCurrentSessionId] = useState(
    activeSession?.id || null,
  );

  const fileRef = useRef(null);
  useEffect(() => {
    localStorage.setItem("studypilot_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem("studypilot_current_session", currentSessionId);
    } else {
      localStorage.removeItem("studypilot_current_session");
    }
  }, [currentSessionId]);
  // ========================
  // SYNC CURRENT SESSION
  // ========================

  useEffect(() => {
    if (!currentSessionId) return;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== currentSessionId) return session;

        return {
          ...session,
          messages,

          title:
            session.title === "New Session" && messages.length > 1
              ? messages[1]?.content?.slice(0, 30)
              : session.title,
        };
      }),
    );
  }, [messages, currentSessionId]);

  // ========================
  //  CORE LOGIC
  // ========================

  const buildUserMessage = (text) => {
    if (files.length === 0) {
      return {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
    }

    return {
      id: crypto.randomUUID(),
      role: "user",
      content: `${text}\n📎 ${files.map((f) => f.name).join(", ")}`,
    };
  };

  const resetInputState = () => {
    setInput("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const createSession = (startMessages = [initialGreeting]) => {
    const session = {
      id: crypto.randomUUID(),
      title: "New Session",
      messages: startMessages,
    };

    setSessions((prev) => {
      const updated = [session, ...prev];
      return updated;
    });

    setCurrentSessionId(session.id);
    setMessages(startMessages);

    return session.id;
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
    const hasFiles = files.length > 0;
    const messageText = input.trim() || (!hasFiles ? getReferenceText() : "");
    const displayText = input.trim() || "Uploaded file.";

    if (!messageText && !hasFiles) return;

    const sessionId = currentSessionId || createSession(messages);

    const userMessage = buildUserMessage(displayText);
    const updated = [...messages, userMessage];

    setMessages(updated);
    setLoading(true);
    resetInputState();

    try {
      const data = await sendChatRequest({
        message: messageText,
        messages: updated,
        files,
      });

      const replyText = data.reply || "No response.";

      await streamAssistantMessage(replyText);
    } catch (err) {
      console.log(err);

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Server error. Please try again.",
      };

      const finalMessages = [...updated, errorMessage];

      setMessages(finalMessages);
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

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ========================
  //  QUIZ
  // ========================

  const GREETING_TEXT = initialGreeting.content;

  const getLastAssistantText = () => {
    return (
      [...messages]
        .reverse()
        .find(
          (msg) =>
            msg.role === "assistant" &&
            msg.content?.trim() &&
            msg.content.trim() !== GREETING_TEXT,
        )
        ?.content?.trim() || ""
    );
  };

  const getLastUserText = () => {
    return (
      [...messages]
        .reverse()
        .find((msg) => msg.role === "user")
        ?.content?.trim() || ""
    );
  };

  const getReferenceText = () => {
    return input.trim() || getLastAssistantText() || getLastUserText();
  };

  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const handleGenerateQuiz = async ({
    questionCount = 10,
    optionCount = 3,
  } = {}) => {
    setQuizLoading(true);
    setQuizResult(null);

    try {
      const hasFiles = files.length > 0;
      const context = input.trim() || (!hasFiles ? getReferenceText() : "");

      const formData = new FormData();
      formData.append("context", context);
      formData.append("questionCount", String(questionCount));
      formData.append("optionCount", String(optionCount));

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(`${API_URL}/api/quiz`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // CONSOLE
      console.log("QUIZ RESPONSE:", data);
      console.log("QUIZ CONTEXT:", context);

      const questions = data.quiz?.questions || [];

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (!questions.length) {
        throw new Error("Quiz returned empty questions");
      }

      setQuiz({
        id: crypto.randomUUID(),
        questions,
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      setQuiz(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuiz = () => {
    handleGenerateQuiz();
  };

  const clearQuiz = () => {
    setQuiz(null);
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
        localStorage.removeItem("studypilot_current_session");

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

    //  quiz
    quiz,
    quizLoading,
    quizResult,
    setQuizResult,
    handleGenerateQuiz,
    clearQuiz,

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
