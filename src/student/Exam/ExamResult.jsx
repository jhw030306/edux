import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import axios from "axios";
import "./ExamTakingLayout.css";

export default function ExamResult() {
  const { search } = useLocation();
  const examId = Number(
    new URLSearchParams(search).get("examId")
  );
  const studentId = Number(
    sessionStorage.getItem("studentId")
  );
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFull = async () => {
    const { data: full } = await axios.get(
      "/api/grading/full",
      {
        params: { examId, studentId },
      }
    );
    setAnswers(full);
  };

  useEffect(() => {
    if (!examId || !studentId) return;
    setLoading(true);
    fetchFull()
      .catch((e) => {
        console.error(e);
        alert("결과 불러오기 실패");
      })
      .finally(() => setLoading(false));
  }, [examId, studentId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">결과 불러오는 중…</div>
      </MainLayout>
    );
  }

  const totalScore = answers.reduce(
    (sum, q) => sum + (q.autoScore || 0),
    0
  );
  const totalMax = answers.reduce(
    (sum, q) => sum + (q.maxScore || 0),
    0
  );

  return (
    <MainLayout>
      <div className="exam-page-container">
        <div className="left-panel">
          {answers.map((q, idx) => {
            const {
              questionId,
              questionText,
              type,
              options = [],
              correctAnswer,
              correctIndex,
              studentAnswer,
              autoScore,
              maxScore,
              isGrade,
            } = q;

            const displayedOptions =
              type === "ox" ? ["O", "X"] : options || [];
            const correctIdx = Number(correctIndex ?? -1);
            const studentIdx =
              type === "multiple"
                ? Number(studentAnswer)
                : displayedOptions.indexOf(studentAnswer);

            let statusSymbol = "";
            if (isGrade === 1) {
              if (autoScore === 0) statusSymbol = "／";
              else if (autoScore === maxScore)
                statusSymbol = "○";
              else statusSymbol = "△";
            }

            return (
              <div
                className="question-box"
                key={questionId}
              >
                {statusSymbol && (
                  <span
                    className={`status-symbol ${
                      statusSymbol === "○"
                        ? "circle"
                        : statusSymbol === "△"
                        ? "triangle"
                        : "slash"
                    }`}
                  >
                    {statusSymbol}
                  </span>
                )}

                <h4>
                  {idx + 1}. {questionText}
                </h4>

                {type !== "subjective" ? (
                  <div className="options">
                    {displayedOptions.map((opt, i) => {
                      const isStudentAnswer =
                        type === "multiple"
                          ? String(i) ===
                            String(studentAnswer)
                          : opt === studentAnswer;
                      const isCorrectAnswer =
                        type === "multiple"
                          ? i === correctIdx
                          : opt === correctAnswer;

                      let labelClass = "option-label";
                      let checked = false;

                      if (isGrade === 1) {
                        if (
                          isStudentAnswer &&
                          isCorrectAnswer
                        ) {
                          labelClass += " correct";
                          checked = true;
                        } else if (
                          isStudentAnswer &&
                          !isCorrectAnswer
                        ) {
                          labelClass += " wrong";
                        } else if (
                          !isStudentAnswer &&
                          isCorrectAnswer
                        ) {
                          labelClass += " student";
                          checked = true;
                        }
                      }

                      return (
                        <label
                          className={labelClass}
                          key={i}
                        >
                          <input
                            type="radio"
                            checked={checked}
                            disabled
                          />
                          <span className="option-text">
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="subjective-answer-block">
                    <label>내 답안:</label>
                    <textarea
                      value={studentAnswer || ""}
                      readOnly
                      disabled
                    />
                    <label>모범 답안:</label>
                    <textarea
                      value={correctAnswer || ""}
                      readOnly
                      disabled
                    />
                  </div>
                )}

                <div className="score-input-row">
                  <label>점수:</label>
                  <input
                    type="number"
                    className="score-field narrow"
                    value={autoScore}
                    disabled
                  />
                  <span>/ {maxScore}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="right-panel">
          <div className="timer-box">
            최종 점수: {totalScore} / {totalMax}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
