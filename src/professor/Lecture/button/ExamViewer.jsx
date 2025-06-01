import React, { useEffect, useState } from "react";
import "./ExamViewer.css";

const ExamViewer = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const examId = JSON.parse(
    sessionStorage.getItem("selectedExam")
  )?.id;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/exam-questions/exam/all/${examId}`
        );
        const data = await res.json();

        const formatted = data.map((q) => {
          const base = {
            id: q.id,
            number: q.number,
            type: q.type,
            question: q.question,
          };

          if (q.type === "multiple") {
            return {
              ...base,
              options: q.distractor || [],
              answerIndex: Number(q.answer) - 1,
            };
          } else if (q.type === "subjective") {
            return {
              ...base,
              answer: q.answer || "",
            };
          } else if (q.type === "ox") {
            return {
              ...base,
              options: ["O", "X"],
              answer: q.answer?.toUpperCase(),
            };
          } else {
            return base;
          }
        });

        setQuestions(
          formatted.sort((a, b) => a.number - b.number)
        );
      } catch (err) {
        console.error("문제 불러오기 실패:", err);
      }
    };

    if (examId) fetchQuestions();
  }, [examId]);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="exam-wrapper exam-off-layout">
      <div className="exam-panels">
        <div className="left-panel">
          {currentQuestion && (
            <div className="question-box">
              <h4>
                {currentQuestion.number}.{" "}
                {currentQuestion.question}
              </h4>

              {currentQuestion.type === "multiple" && (
                <div className="options">
                  {currentQuestion.options.map(
                    (opt, idx) => (
                      <label key={idx}>
                        <input
                          type="radio"
                          disabled
                          checked={
                            idx ===
                            currentQuestion.answerIndex
                          }
                        />
                        {opt}
                      </label>
                    )
                  )}
                </div>
              )}

              {currentQuestion.type === "ox" && (
                <div className="options">
                  {["O", "X"].map((opt, idx) => (
                    <label key={idx}>
                      <input
                        type="radio"
                        disabled
                        checked={
                          opt === currentQuestion.answer
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "subjective" && (
                <textarea
                  readOnly
                  value={currentQuestion.answer || ""}
                />
              )}
            </div>
          )}

          <div className="answer-sheet">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`num-btn ${
                  idx === currentIndex ? "active" : ""
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamViewer;
