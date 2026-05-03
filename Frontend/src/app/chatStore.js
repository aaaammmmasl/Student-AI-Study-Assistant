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
      id: crypto.randomUUID(),
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

      //  typing effect
      await streamAssistantMessage(replyText);

      setMessages((prev) => {
        syncSession(sessionId, prev);
        return prev;
      });
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

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  // ========================
  //  QUIZ
  // ========================

  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const generateQuizRequest = async ({
    context,
    questionCount,
    optionCount,
  }) => {
    const res = await fetch("http://localhost:5000/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context,
        questionCount,
        optionCount,
      }),
    });

    return res.json();
  };

  const handleGenerateQuiz = async ({
    questionCount = 10,
    optionCount = 3,
  } = {}) => {
    let context = input?.trim();

    if (!context) {
      const lastAssistant = [...messages]
        .reverse()
        .find((msg) => msg.role === "assistant");

      context = lastAssistant?.content;
    }

    //  3. fallback → آخر محادثة
    if (!context) {
      context = messages
        .slice(-6)
        .map((m) => m.content)
        .join("\n");
    }

    if (!context || !context.trim()) return;

    setQuizLoading(true);
    setQuizResult(null);

    try {
      const data = await generateQuizRequest({
        context,
        questionCount,
        optionCount,
      });

      setQuiz({
        id: crypto.randomUUID(),
        questions: Array.isArray(data.quiz) ? data.quiz : data.quiz?.quiz || [],
      });
    } catch (error) {
      console.log(error);
      setQuiz(null);
    }

    setQuizLoading(false);
  };

  const handleQuiz = () => {
    handleGenerateQuiz();
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

    //  quiz
    quiz,
    quizLoading,
    quizResult,
    setQuizResult,
    handleGenerateQuiz,

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
