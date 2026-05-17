import { useState, useRef, useEffect } from "react";
import { sendChatRequest } from "../services/chatApi";

const API_URL = import.meta.env.VITE_API_URL;

const initialGreeting = {
  id: 1,
  role: "assistant",
  content: "Hello, I'm StudyPilot. Ask me anything.",
};

export function useChatStore() {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const fileRef = useRef(null);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ========================
  // DB
  // ========================

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`);
        const data = await res.json();

        setSessions(data);

        if (data.length > 0) {
          setCurrentSessionId(data[0].id);
        }
      } catch (err) {
        console.log("Failed to load sessions", err);
      }
    };

    fetchSessions();
  }, []);
  // ========================
  // SYNC CURRENT SESSION
  // ========================

  useEffect(() => {
    if (!currentSessionId) return;

    const fetchMessages = async () => {
      const res = await fetch(`${API_URL}/api/messages/${currentSessionId}`);
      const data = await res.json();

      setMessages(data);
    };

    fetchMessages();
  }, [currentSessionId]);

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

  // ========================
  //  ACTIONS UI
  // ========================

  const handleNewChat = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Session",
        }),
      });

      const newSession = await res.json();

      setSessions((prev) => [newSession, ...prev]);

      setCurrentSessionId(newSession.id);
      setMessages([]);

      resetInputState();
    } catch (err) {
      console.log("Failed to create session", err);
    }
  };

  const loadSession = async (session) => {
    setCurrentSessionId(session.id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/${session.id}`,
      );

      const data = await res.json();

      setMessages(data);
    } catch (err) {
      console.log("Failed to load messages", err);
      setMessages([]);
    }

    resetInputState();
  };

  const getReferenceText = () => {
    return input.trim() || getLastAssistantText() || getLastUserText();
  };

  const handleSend = async () => {
    const hasFiles = files.length > 0;
    const messageText = input.trim() || (!hasFiles ? getReferenceText() : "");
    const displayText = input.trim() || "Uploaded file.";

    if (!messageText && !hasFiles) return;

    let sessionId = currentSessionId;

    // create session if missing
    if (!sessionId) {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: displayText.slice(0, 30),
        }),
      });

      const newSession = await res.json();
      sessionId = newSession.id;

      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
    }

    resetInputState();
    setLoading(true);

    // 1. save user message
    await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        role: "user",
        content: displayText,
      }),
    });

    // 2. AI response
    try {
      const data = await sendChatRequest({
        message: messageText,
        messages: [], // مهم: لا تعتمد على frontend state هنا
        files,
      });

      const replyText = data.reply;

      // save assistant message
      await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          role: "assistant",
          content: replyText,
        }),
      });

      // 3. IMPORTANT: reload from DB
      const res = await fetch(`${API_URL}/api/messages/${sessionId}`);
      const freshMessages = await res.json();

      setMessages(freshMessages);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Server error. Please try again.",
        },
      ]);
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

  const renameSession = async (id, newTitle) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      const updatedSession = await res.json();

      setSessions((prev) =>
        prev.map((session) => (session.id === id ? updatedSession : session)),
      );
    } catch (err) {
      console.log("Failed to rename session", err);
      console.log("API_URL =", API_URL);
      console.log("PATCH URL =", `${API_URL}/api/sessions/${id}`);
    }
  };
  const deleteSession = async (id) => {
    try {
      await fetch(`${API_URL}/api/sessions/${id}`, {
        method: "DELETE",
      });

      const res = await fetch(`${API_URL}/api/sessions`);
      const data = await res.json();

      setSessions(data);

      if (currentSessionId === id) {
        if (data.length > 0) {
          setCurrentSessionId(data[0].id);

          const messagesRes = await fetch(
            `${API_URL}/api/messages/${data[0].id}`,
          );
          const messagesData = await messagesRes.json();
          setMessages(messagesData);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.log("Failed to delete session", err);
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
