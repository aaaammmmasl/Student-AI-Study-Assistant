import { useState, useEffect, useMemo } from "react";
import { sendChatRequest } from "../services/chatApi";

import api from "../services/api";

const initialGreeting = {
  id: 1,
  role: "assistant",
  content: "Hello, I'm StudyPilot. Ask me anything.",
};

export function useChatStore() {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ========================
  // DB
  // ========================

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/api/sessions");
        const data = res.data;

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

    const token = localStorage.getItem("token");
    if (!token) return;

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
  };

  const getReferenceText = () => {
    return lastAssistantText || lastUserText;
  };

  const handleSend = async ({ text, files = [] }) => {
    const hasFiles = files.length > 0;

    const messageText = text.trim() || (!hasFiles ? getReferenceText() : "");
    const displayText = text.trim() || "Uploaded file.";

    if (!messageText && !hasFiles) return;

    let sessionId = currentSessionId;

    try {
      if (!sessionId) {
        const res = await api.post("/api/sessions", {
          title: displayText.slice(0, 30),
        });

        const newSession = res.data;
        sessionId = newSession.id;

        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: displayText,
        },
      ]);

      setLoading(true);

      await api.post("/api/messages", {
        sessionId,
        role: "user",
        content: displayText,
      });

      const data = await sendChatRequest({
        message: messageText,
        sessionId,
        files,
      });

      const replyText = data.reply;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: replyText,
        },
      ]);

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

  // ========================
  //  QUIZ
  // ========================

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
    context = "",
    files = [],
    questionCount = 10,
    optionCount = 3,
  } = {}) => {
    setQuizLoading(true);
    setQuizResult(null);

    try {
      const finalContext = context.trim() || getReferenceText();

      const formData = new FormData();
      formData.append("context", finalContext);
      formData.append("questionCount", String(questionCount));
      formData.append("optionCount", String(optionCount));

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await api.post("/api/quiz", formData);
      const questions = res.data.quiz?.questions || [];

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
    loading,
    sessions,
    currentSessionId,

    // setters
    setSessions,
    setMessages,
    setCurrentSessionId,

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
  };
}
