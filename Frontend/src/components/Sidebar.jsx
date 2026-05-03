import { useMemo, useState } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  MessageSquare,
  Clock3,
} from "lucide-react";

function Sidebar({
  sessions,
  currentSessionId,
  handleNewChat,
  loadSession,
  renameSession,
  deleteSession,
  isOpen,
  setIsOpen,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [search, setSearch] = useState("");

  // =========================
  // Helpers
  // =========================
  const filteredSessions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return sessions;

    return sessions.filter((session) =>
      session.title.toLowerCase().includes(keyword),
    );
  }, [sessions, search]);

  const startEdit = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setDraftTitle(session.title);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setDraftTitle("");
  };

  const saveEdit = (id, e) => {
    e.stopPropagation();

    const finalTitle = draftTitle.trim();

    if (!finalTitle) return;

    renameSession(id, finalTitle);

    setEditingId(null);
    setDraftTitle("");
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this session?",
    );

    if (confirmDelete) {
      deleteSession(id);
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}
      <aside
        className={`
    fixed z-50 md:static
    h-full w-80 shrink-0 flex-col h-full flex flex-col
    border-r border-white/10 bg-zinc-950
    transition-transform duration-300
    md:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        {/* Top Logo */}
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400 text-black shadow-lg">
              <Sparkles size={18} />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-white">StudyPilot</h1>
              <p className="text-xs text-zinc-400">AI Study Assistant</p>
            </div>
          </div>
        </div>
        {/* New Chat */}
        <div className="px-4 pt-4">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        {/* Search */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2.5">
            <Search size={15} className="text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>
        {/* Label */}
        <div className="flex items-center gap-2 px-5 pb-2 pt-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <Clock3 size={14} />
          Recent Chats
        </div>
        {/* Sessions */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {filteredSessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
              No chats found.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const active = currentSessionId === session.id;
              const editing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => !editing && loadSession(session)}
                  className={`group mb-2 cursor-pointer rounded-2xl border px-4 py-3 transition ${
                    active
                      ? "border-lime-400/30 bg-lime-400/10"
                      : "border-transparent bg-zinc-900 hover:border-white/10 hover:bg-zinc-800"
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-start gap-2">
                    <MessageSquare
                      size={15}
                      className="mt-0.5 shrink-0 text-zinc-500"
                    />

                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <input
                          autoFocus
                          value={draftTitle}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEdit(session.id, e);
                            }

                            if (e.key === "Escape") {
                              cancelEdit(e);
                            }
                          }}
                          className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
                        />
                      ) : (
                        <div className="truncate text-sm font-medium text-white">
                          {session.title}
                        </div>
                      )}

                      {!editing && (
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                          {session.messages?.[1]?.content ||
                            "Start your conversation..."}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      {editing ? (
                        <>
                          <button
                            onClick={(e) => saveEdit(session.id, e)}
                            className="rounded-lg p-2 text-lime-400 hover:bg-white/5"
                          >
                            <Check size={15} />
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startEdit(session, e)}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={(e) => handleDelete(session.id, e)}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4 text-xs text-zinc-500">
          {sessions.length} Chats Saved
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
