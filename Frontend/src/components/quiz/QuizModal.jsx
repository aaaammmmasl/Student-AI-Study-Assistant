import { useState } from "react";

function QuizModal({ isOpen, onClose, quiz, loading, handleGenerateQuiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let correct = 0;

    quiz.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
  };

  const total = quiz?.length || 0;

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
          <h2 className="text-lg font-semibold text-white">Quiz</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick generate buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <button
            onClick={() =>
              handleGenerateQuiz({ questionCount: 5, optionCount: 3 })
            }
            className="rounded-lg bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
          >
            5 Questions
          </button>

          <button
            onClick={() =>
              handleGenerateQuiz({ questionCount: 10, optionCount: 3 })
            }
            className="rounded-lg bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
          >
            10 Questions
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-sm text-zinc-400">Generating quiz...</div>
        )}

        {/* Empty */}
        {!loading && quiz && quiz.length === 0 && (
          <div className="mt-6 text-sm text-zinc-500">
            No questions available.
          </div>
        )}

        {/* Questions */}
        {!loading && quiz && quiz.length > 0 && (
          <div className="mt-6 space-y-6">
            {quiz.map((q, i) => {
              const userAnswer = answers[i];
              const correct = q.correctIndex;

              return (
                <div
                  key={q.id || i}
                  className="rounded-2xl border border-white/10 bg-zinc-800 p-4"
                >
                  {/* Question */}
                  <div className="text-sm font-medium text-white">
                    {i + 1}. {q.question}
                  </div>

                  {/* Options */}
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

                  {/* Explanation */}
                  {submitted && (
                    <div className="mt-3 text-xs text-zinc-400">
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit */}
            {!submitted && total > 0 && (
              <button
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-lime-400 py-3 font-semibold text-black hover:bg-lime-300"
              >
                Submit Answers
              </button>
            )}

            {/* Final score */}
            {submitted && (
              <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4 text-center">
                <div className="text-lg font-semibold text-white">
                  Score: {score} / {total}
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
