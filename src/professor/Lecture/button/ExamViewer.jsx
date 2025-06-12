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

        const formatted = data.map((q) => ({
          id: q.id,
          number: q.number,
          type: q.type,
          question: q.question,
          options: q.distractor || [],
        }));

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
                        <input type="radio" disabled />
                        {opt}
                      </label>
                    )
                  )}
                </div>
              )}

              {currentQuestion.type === "ox" && (
                <div className="options">
                  {["O", "X"].map((opt) => (
                    <label key={opt}>
                      <input type="radio" disabled />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "subjective" && (
                <textarea
                  readOnly
                  value=""
                  placeholder="정답 비공개"
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
