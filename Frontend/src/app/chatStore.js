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
    return input.trim() || getLastUserText() || getLastAssistantText();
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

      const res = await fetch("http://localhost:5000/api/quiz", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("QUIZ RESPONSE:", data);
      console.log("QUIZ CONTEXT:", context);

      const questions =
        data.quiz?.quiz?.questions ||
        data.quiz?.quiz ||
        data.quiz?.questions ||
        data.questions ||
        [];

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
