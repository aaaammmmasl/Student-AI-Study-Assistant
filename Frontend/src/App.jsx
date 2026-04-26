import { useState } from "react";
import TextInput from "./components/TextInput";
import FileUpload from "./components/FileUpload";
import Actions from "./components/Actions";
import Result from "./components/Result";

import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!prompt.trim() && !text.trim() && !file) {
      setResult("أدخل prompt أو نصًا أو ارفع ملف PDF أولًا");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prompt", prompt);
        formData.append("text", text);

        const res = await fetch("http://localhost:5000/api/upload-pdf", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setResult(data.summary || data.text || "تمت العملية بنجاح");
      } else {
        const res = await fetch("http://localhost:5000/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            text,
          }),
        });

        const data = await res.json();
        setResult(data.summary || "تمت العملية بنجاح");
      }
    } catch (error) {
      console.log(error);
      setResult("cannot connect with server");
    }

    setLoading(false);
  };

  const handleQuiz = () => {
    setResult("Quiz feature not implemented yet");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>AI Tool</h2>

      <textarea
        placeholder="اكتب prompt مثل: لخص في نقاط، اشرح ببساطة، اصنع ملخصًا أكاديميًا..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          marginBottom: "16px",
          padding: "12px",
          borderRadius: "8px",
        }}
      />

      <TextInput text={text} setText={setText} file={file} />

      <div style={{ marginTop: "12px" }}>
        <FileUpload file={file} setFile={setFile} />
      </div>

      <div style={{ marginTop: "12px" }}>
        <Actions onSummarize={handleSummarize} onQuiz={handleQuiz} />
      </div>

      <div style={{ marginTop: "20px" }}>
        {loading ? <p>Loading...</p> : <Result result={result} />}
      </div>
    </div>
  );
}

export default App;
