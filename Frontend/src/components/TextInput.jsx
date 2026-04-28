function TextInput({ text, setText, file }) {
  return (
    <div className="relative">
      <textarea
        placeholder="Write or paste text here. If you upload a PDF, this area will still show your notes."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        className="min-h-[240px] w-full resize-none rounded-3xl border border-white/10 bg-zinc-950/70 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-zinc-500 focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/10"
      />

      {file && (
        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-300 shadow-lg shadow-lime-400/5">
          <span>📎</span>
          <span className="max-w-[180px] truncate">{file.name}</span>
        </div>
      )}
    </div>
  );
}

export default TextInput;