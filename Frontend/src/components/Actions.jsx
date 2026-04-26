function Actions({ onSummarize, onQuiz }) {
  return (
    <div>
      <button onClick={onSummarize}>Summarize</button>
      <button onClick={onQuiz} style={{ marginLeft: "10px" }}>
        Generate Quiz
      </button>
    </div>
  );
}

export default Actions;
