import { Clock3, FileText } from "lucide-react";

function History({ history, setResult }) {
  if (!history.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/50 px-4 py-6 text-sm text-zinc-500">
        No history yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => {
        const preview =
          item.prompt?.trim() ||
          item.text?.trim() ||
          "No preview available";

        return (
          <button
            key={item.id}
            onClick={() => setResult(item.result)}
            className="w-full rounded-3xl border border-white/10 bg-zinc-950/50 p-4 text-left transition hover:border-lime-400/20 hover:bg-zinc-900/80"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-300">
                <FileText size={12} />
                {item.type}
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                <Clock3 size={12} />
                {new Date(item.id).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <p className="line-clamp-2 text-sm leading-6 text-zinc-200">
              {preview}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default History;