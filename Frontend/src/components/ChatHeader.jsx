import { Menu } from "lucide-react";

function ChatHeader({ toggleSidebar, visible = true }) {
  return (
    <header
      className={`flex items-center gap-3 border-b border-white/10 bg-zinc-950/95 px-4 py-4 backdrop-blur transition-transform duration-300 md:translate-y-0 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="rounded-lg bg-zinc-800 p-2 hover:bg-zinc-700 md:hidden"
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
