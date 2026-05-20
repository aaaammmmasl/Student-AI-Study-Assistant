import { useState, useRef, useEffect, useMemo } from "react";
import { sendChatRequest } from "../services/chatApi";

import api from "../services/api";

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
        const res = await api.get("/api/sessions");

        const data = res.data;

        // حماية من crash
        if (!Array.isArray(data)) {
          console.log("Invalid sessions response:", data);
          setSessions([]);
          return;
        }

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
      try {
        const res = await api.get(`/api/messages/${currentSessionId}`);
        const data = res.data;

        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Failed to fetch message", err);
        setMessages([]);
      }
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
      const res = await api.post("/api/sessions", {
        title: "New Session",
      });

      const newSession = res.data;

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
      const res = await api.get(`/api/messages/${session.id}`);

      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to load messages", err);
      setMessages([]);
    }

    resetInputState();
  };

  const getReferenceText = () => {
    return input.trim() || lastAssistantText || lastUserText;
  };

  const handleSend = async () => {
    const hasFiles = files.length > 0;

    const messageText = input.trim() || (!hasFiles ? getReferenceText() : "");

    const displayText = input.trim() || "Uploaded file.";

    if (!messageText && !hasFiles) return;

    let sessionId = currentSessionId;

    try {
      // =========================
      // CREATE SESSION IF NEEDED
      // =========================

      if (!sessionId) {
        const res = await api.post("/api/sessions", {
          title: displayText.slice(0, 30),
        });

        const newSession = res.data;

        sessionId = newSession.id;

        setSessions((prev) => [newSession, ...prev]);

        setCurrentSessionId(sessionId);
      }

      // =========================
      // USER MESSAGE UI
      // =========================

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: displayText,
      };

      setMessages((prev) => [...prev, userMessage]);

      resetInputState();

      setLoading(true);

      // =========================
      // SAVE USER MESSAGE
      // =========================

      await api.post("/api/messages", {
        sessionId,
        role: "user",
        content: displayText,
      });

      // =========================
      // AI REQUEST
      // =========================

      const data = await sendChatRequest({
        message: messageText,
        sessionId,
        files,
      });

      const replyText = data.reply;

      // =========================
      // ASSISTANT UI MESSAGE
      // =========================

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // =========================
      // SAVE ASSISTANT MESSAGE
      // =========================

      await api.post("/api/messages", {
        sessionId,
        role: "assistant",
        content: replyText,
      });
    } catch (err) {
      console.log("Send Error:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Server error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (
        msg.role === "assistant" &&
        msg.content?.trim() &&
        msg.content !== initialGreeting.content
      ) {
        return msg.content.trim();
      }
    }
    return "";
  }, [messages]);

  const lastUserText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "user") {
        return msg.content.trim();
      }
    }
    return "";
  }, [messages]);
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

      const res = await api.post("/api/quiz", formData);

      const data = res.data;

      console.log("QUIZ RESPONSE:", data);
      console.log("QUIZ CONTEXT:", context);

      const questions = data.quiz?.questions || [];

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
      const res = await api.patch(`/api/sessions/${id}`, {
        title: newTitle,
      });

      const updatedSession = res.data;

      setSessions((prev) =>
        prev.map((session) => (session.id === id ? updatedSession : session)),
      );
    } catch (err) {
      console.log("Failed to rename session", err);
    }
  };
  const deleteSession = async (id) => {
    try {
      await api.delete(`/api/sessions/${id}`);

      const res = await api.get("/api/sessions");
      const data = res.data;

      setSessions(Array.isArray(data) ? data : []);

      if (currentSessionId === id) {
        if (Array.isArray(data) && data.length > 0) {
          const newId = data[0].id;

          setCurrentSessionId(newId);

          const messagesRes = await api.get(`/api/messages/${newId}`);

          setMessages(messagesRes.data);
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
