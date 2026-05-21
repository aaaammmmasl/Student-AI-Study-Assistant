import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Brain } from "lucide-react";

function ChatInput({ handleSend, handleQuiz, onDraftChange }) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    onDraftChange?.({ text: input, files });
  }, [input, files, onDraftChange]);

  const submit = () => {
     handleSend({ text: input, files });
    setInput("");
    setFiles([]);
  };

  const openQuiz = () => {
    handleQuiz({ text: input, files });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900 p-4">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-xs text-zinc-300"
            >
              <Paperclip size={14} />
              {file.name}
              <button
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                className="ml-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask StudyPilot anything..."
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500"
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            multiple
            hidden
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);
              if (selectedFiles.length > 0) {
                setFiles((prev) => [...prev, ...selectedFiles]);
              }
              e.target.value = "";
            }}
          />

          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl bg-zinc-800 p-3 hover:bg-zinc-700"
          >
            <Paperclip size={18} />
          </button>

          <button
            onClick={openQuiz}
            className="rounded-xl bg-zinc-800 p-3 hover:bg-zinc-700"
          >
            <Brain size={18} />
          </button>
        </div>

        <button
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-semibold text-black hover:bg-lime-300"
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
