import { useEffect, useState } from "react";

function QuizModal({ isOpen, onClose, quiz, loading, handleGenerateQuiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // إعدادات التوليد
  const [questionCount, setQuestionCount] = useState(5);
  const [optionCount, setOptionCount] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
    }
  }, [isOpen]);

  // 🔥 مهم: إعادة reset لكل quiz جديد
  useEffect(() => {
    if (quiz) {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
    }
  }, [quiz]);

  if (!isOpen) return null;

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let correct = 0;

    quiz.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Quiz Generator</h2>

          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* ========================= */}
        {/* SETTINGS (IMPORTANT PART) */}
        {/* ========================= */}
        {!quiz && (
          <div className="mt-6 space-y-4">
            {/* Question Count */}
            <div>
              <label className="text-xs text-zinc-400">
                Number of Questions
              </label>

              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-zinc-800 p-2 text-white"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Option Count */}
            <div>
              <label className="text-xs text-zinc-400">
                Options per Question
              </label>

              <select
                value={optionCount}
                onChange={(e) => setOptionCount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-zinc-800 p-2 text-white"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerateQuiz({ questionCount, optionCount })}
              className="w-full rounded-2xl bg-lime-400 py-3 font-semibold text-black hover:bg-lime-300"
            >
              Generate Quiz
            </button>

            {loading && (
              <div className="mt-6 text-sm text-zinc-400">
                Generating quiz...
              </div>
            )}

            {!loading && !quiz && (
              <div className="mt-6 text-sm text-zinc-500">
                No quiz generated yet.
              </div>
            )}
          </div>
        )}

        {/* ========================= */}
        {/* QUIZ RESULTS */}
        {/* ========================= */}
        {quiz && (
          <div className="mt-6 space-y-6">
            {quiz.map((q, i) => {
              const userAnswer = answers[i];
              const correct = q.correctIndex;

              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-zinc-800 p-4"
                >
                  <div className="text-sm font-medium text-white">
                    {i + 1}. {q.question}
                  </div>

                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, j) => {
                      const isSelected = userAnswer === j;
                      const isCorrect = j === correct;

                      let base =
                        "w-full text-left px-3 py-2 rounded-xl border transition";

                      if (submitted) {
                        if (isCorrect) {
                          base +=
                            " border-green-500 bg-green-500/10 text-green-300";
                        } else if (isSelected) {
                          base += " border-red-500 bg-red-500/10 text-red-300";
                        } else {
                          base += " border-white/10 text-zinc-400";
                        }
                      } else {
                        base += isSelected
                          ? " border-lime-400 bg-lime-400/10 text-white"
                          : " border-white/10 text-zinc-300 hover:bg-zinc-700";
                      }

                      return (
                        <button
                          key={j}
                          onClick={() => handleSelect(i, j)}
                          className={base}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="mt-3 text-xs text-zinc-400">
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit */}
            {!submitted && (
              <button
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-lime-400 py-3 font-semibold text-black hover:bg-lime-300"
              >
                Submit Answers
              </button>
            )}

            {/* Score */}
            {submitted && (
              <div className="text-center rounded-2xl bg-zinc-800 border border-white/10 p-4">
                <div className="text-white font-semibold">
                  Score: {score} / {quiz.length}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizModal;
