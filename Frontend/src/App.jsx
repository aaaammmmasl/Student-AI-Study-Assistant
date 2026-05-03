import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/chat/ChatMessages";
import ChatInput from "./components/chat/ChatInput";

import { useChatStore } from "./app/chatStore";
import { useEffect, useRef, useState } from "react";

import QuizModal from "./components/quiz/QuizModal";

function App() {
  const chat = useChatStore();
  const bottomRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleOpenQuiz = () => {
    setIsQuizOpen(true);
    chat.handleGenerateQuiz();
  };
  // Auto scroll to bottom whenever messages change

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.loading]);
  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-white">
      <div className="flex h-full w-full">
        <Sidebar
          {...chat}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        <main className="flex h-full min-w-0 flex-1 flex-col">
          {/* Header fixed*/}
          <ChatHeader toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

          {/* Messages area (scrollable فقط هنا) */}
          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <ChatMessages messages={chat.messages} loading={chat.loading} />

              {/* auto scroll */}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input fixed*/}
          <div className="shrink-0 border-t border-white/10 bg-zinc-950/80 backdrop-blur">
            <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-8">
              <ChatInput {...chat} handleQuiz={handleOpenQuiz} />
            </div>
          </div>
        </main>
        <QuizModal
          key={chat.quiz?.id || "empty"}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          quiz={chat.quiz?.questions}
          loading={chat.quizLoading}
          handleGenerateQuiz={chat.handleGenerateQuiz}
        />
      </div>
    </div>
  );
}

export default App;
