// GradingStudentPage.jsx
import React, { useState } from "react";
import { MainLayout } from "../../layout/MainLayout";
import "./GradingStudent.css";

const GradingStudent = () => {
  const [answers, setAnswers] = useState({
    1: {
      type: "multiple",
      question: "CSS에서 스타일 우선순위가 높은 선택자는?",
      options: [
        "id 선택자",
        "클래스 선택자",
        "태그 선택자",
        "전체 선택자",
      ],
      studentAnswer: 1,
      correctAnswer: 0,
      score: 0,
      maxScore: 5,
    },
    2: {
      type: "subjective",
      question:
        "JavaScript에서 변수를 선언하는 키워드 3가지는?",
      studentAnswer: "var, let",
      score: 0,
      maxScore: 5,
    },
  });

  const handleScoreChange = (qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { ...prev[qid], score: Number(value) },
    }));
  };

  const totalScore = Object.values(answers).reduce(
    (sum, q) => sum + (q.score || 0),
    0
  );

  return (
    <MainLayout>
      <div className="exam-wrapper exam-off-layout">
        <div className="exam-panels">
          <div className="left-panel">
            {Object.entries(answers).map(
              ([qid, q], idx) => (
                <div className="question-box" key={qid}>
                  <h4>
                    {idx + 1}. {q.question}
                  </h4>

                  {q.type === "multiple" && (
                    <div className="options">
                      {q.options.map((opt, i) => {
                        const isCorrect =
                          i === q.correctAnswer;
                        const isStudent =
                          i === q.studentAnswer;
                        const isWrong =
                          isStudent && !isCorrect;
                        const classNames = [
                          "option-label",
                          isCorrect ? "correct" : "",
                          isStudent ? "student" : "",
                          isWrong ? "wrong" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <label
                            key={i}
                            className={classNames}
                          >
                            <input
                              type="radio"
                              checked={isStudent}
                              disabled
                            />
                            <span className="option-text">
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "subjective" && (
                    <textarea
                      value={q.studentAnswer}
                      readOnly
                      disabled
                    />
                  )}

                  <div className="score-input-row">
                    <label>점수:</label>
                    <input
                      type="number"
                      className="score-field narrow"
                      value={q.score}
                      min={0}
                      max={q.maxScore}
                      onChange={(e) =>
                        handleScoreChange(
                          qid,
                          e.target.value
                        )
                      }
                    />
                    <span>/ {q.maxScore}</span>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="right-panel">
            <div className="timer-box">
              총점: {totalScore}
            </div>
            <button className="submit-btn">
              점수 저장
            </button>
            <button className="submit-btn return-btn">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GradingStudent;
