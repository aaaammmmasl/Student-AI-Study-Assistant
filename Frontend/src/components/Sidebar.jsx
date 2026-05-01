import { Sparkles, Plus, History as HistoryIcon } from "lucide-react";

function Sidebar({ sessions, currentSessionId, handleNewChat, loadSession }) {
  return (
    <aside className="hidden h-full w-80 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-zinc-900 md:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400 text-black">
            <Sparkles size={18} />
          </div>

          <div>
            <h1 className="text-lg font-semibold">StudyPilot</h1>
            <p className="text-xs text-zinc-400">AI Study Assistant</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 p-4">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-sm font-medium hover:bg-zinc-700"
        >
          <Plus size={16} />
          New Session
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 pb-2 pt-4 text-sm text-zinc-400">
        <HistoryIcon size={16} />
        Recent Activity
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/50 px-4 py-6 text-sm text-zinc-500">
            No sessions yet.
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => loadSession(session)}
              className={`mb-3 w-full rounded-3xl border px-4 py-4 text-left transition ${
                currentSessionId === session.id
                  ? "border-lime-400/30 bg-lime-400/10"
                  : "border-white/10 bg-zinc-950/50 hover:border-lime-400/20 hover:bg-zinc-900/80"
              }`}
            >
              <div className="text-sm font-medium text-zinc-100">
                {session.title}
              </div>

              <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                {session.messages?.[1]?.content || "Conversation session"}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
