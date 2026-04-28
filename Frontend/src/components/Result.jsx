function Result({ result }) {
  if (!result) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Result
        </h3>
      </div>

      <div className="whitespace-pre-wrap text-left text-sm leading-8 text-zinc-100">
        {result}
      </div>
    </div>
  );
}

export default Result;