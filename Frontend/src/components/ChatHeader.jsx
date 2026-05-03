import { Menu } from "lucide-react";

function ChatHeader({ toggleSidebar }) {
  return (
    <header className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-8">
      {/* زر الموبايل */}
      <button
        onClick={toggleSidebar}
        className="md:hidden rounded-lg bg-zinc-800 p-2 hover:bg-zinc-700"
      >
        <Menu size={18} />
      </button>

      <div>
        <h2 className="text-xl font-semibold">StudyPilot Chat</h2>
        <p className="text-sm text-zinc-400">
          Summarize notes, analyze PDFs, and prepare quizzes.
        </p>
      </div>
    </header>
  );
}

export default ChatHeader;
