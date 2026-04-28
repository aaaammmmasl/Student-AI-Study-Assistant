import { useState, useRef, useEffect } from "react";
import { Sparkles, Plus, History as HistoryIcon } from "lucide-react";

import TextInput from "./components/TextInput";
import FileUpload from "./components/FileUpload";
import Actions from "./components/Actions";
import Result from "./components/Result";
import History from "./components/History";

function App() {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // 📌 Reference to the result container
  const resultRef = useRef(null);

  // 📌 Auto scroll when result changes
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [result]);

  const handleSummarize = async () => {
    if (!prompt.trim() && !text.trim() && !file) {
      setResult("Please enter a request, text, or upload a PDF first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      let data;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prompt", prompt);
        formData.append("text", text);

        const res = await fetch("http://localhost:5000/api/upload-pdf", {
          method: "POST",
          body: formData,
        });

        data = await res.json();
      } else {
        const res = await fetch("http://localhost:5000/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, text }),
        });

        data = await res.json();
      }

      const finalResult = data.summary || "Done successfully.";
      setResult(finalResult);

      setHistory((prev) => [
        {
          id: Date.now(),
          prompt,
          text: text || "PDF input",
          result: finalResult,
          type: file ? "pdf" : "text",
        },
        ...prev,
      ]);
    } catch (error) {
      console.log(error);
      setResult("Cannot connect with server.");
    }

    setLoading(false);
  };

  const handleQuiz = () => {
    setResult("Quiz feature coming soon.");
  };

  return (
    <div className="h-screen w-full bg-zinc-950 text-white overflow-hidden">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex w-80 shrink-0 flex-col border-r border-white/10 bg-zinc-900 h-full overflow-y-auto">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400 text-black">
                <Sparkles size={18} />
              </div>

              <div className="mt-3">
                <h1 className="text-lg font-semibold">StudyPilot</h1>
                <p className="text-xs text-zinc-400">AI Study Assistant</p>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 p-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-800 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700">
              <Plus size={16} />
              New Session
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 pb-2 pt-4 text-sm text-zinc-400">
            <HistoryIcon size={18} />
            Recent Activity
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <History history={history} setResult={setResult} />
          </div>
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col min-w-0 w-full h-full overflow-y-auto">
          {/* Header */}
          <header className="w-full border-b border-white/10 px-8 py-5">
            <h2 className="text-xl font-semibold">StudyPilot Workspace</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Summarize notes, analyze PDFs, and prepare quizzes instantly.
            </p>
          </header>

          {/* Content */}
          <div className="flex-1 w-full px-4 sm:px-8 py-8">
            <div className="w-full max-w-5xl mx-auto space-y-10">
              {!result && (
                <div>
                  <h3 className="text-4xl font-semibold tracking-tight">
                    Ready to study smarter?
                  </h3>
                  <p className="mt-4 text-zinc-400 text-lg">
                    Upload your files or paste content and let AI organize your
                    learning.
                  </p>
                </div>
              )}

              {/* Input */}
              <div className="w-full rounded-3xl border border-white/10 bg-zinc-900 p-6 space-y-5">
                <textarea
                  placeholder="What do you want? Example: Summarize in 5 points..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />

                <TextInput text={text} setText={setText} file={file} />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <FileUpload file={file} setFile={setFile} />
                  <Actions onSummarize={handleSummarize} onQuiz={handleQuiz} />
                </div>
              </div>

              {/* Result (AUTO SCROLL TARGET) */}
              <div ref={resultRef} className="w-full">
                {loading ? (
                  <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-zinc-400">
                    Generating response...
                  </div>
                ) : (
                  <Result result={result} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
