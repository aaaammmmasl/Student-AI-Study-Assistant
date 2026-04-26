import { useState } from "react";
import TextInput from "./components/TextInput";
import FileUpload from "./components/FileUpload";
import Actions from "./components/Actions";
import Result from "./components/Result";

import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data.summary);
    } catch (error) {
      setResult("cannot connect with sever");
      console.log(error);
    }
    setLoading(false);
  };

  const handleQuiz = () => {
    setResult("Quiz feature not implemented yet");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Tool</h2>

      <TextInput text={text} setText={setText} />

      <br />

      <FileUpload setFile={setFile} />

      <br />

      <Actions onSummarize={handleSummarize} onQuiz={handleQuiz} />

      <Result result={result} />
    </div>
  );
}

export default App;
