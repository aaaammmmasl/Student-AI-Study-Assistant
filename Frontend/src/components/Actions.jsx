import { Sparkles, ScanSearch } from "lucide-react";

function Actions({ onSummarize, onQuiz }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onSummarize}
        className="inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-lime-300"
      >
        <Sparkles size={16} />
        Summarize
      </button>

      <button
        onClick={onQuiz}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
      >
        <ScanSearch size={16} />
        Generate Quiz
      </button>
    </div>
  );
}

export default Actions;