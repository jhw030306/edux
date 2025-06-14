import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import api from "../../api/axios";
import "./GradingStudent.css";

export default function GradingStudent() {
  const { student, examId } = useLocation().state || {};
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFull = async () => {
    const { data: full } = await api.get("/grading/full", {
      params: { examId, studentId: student.studentId },
    });
    setAnswers(full);
  };

  useEffect(() => {
    if (!student || !examId) return;
    setLoading(true);
    fetchFull()
      .catch((e) => {
        console.error(e);
        alert("시험지 불러오기 실패");
      })
      .finally(() => setLoading(false));
  }, [student, examId]);

  const handleSave = async () => {
    try {
      const toSave = answers.filter((q) => q.type === "subjective");
      await Promise.all(
        toSave.map((q) =>
          api.post("/grading/grade", {
            examQuestionId: q.questionId,
            examResultId: q.examResultId,
            score: q.autoScore,
          })
        )
      );
      await fetchFull();
      alert("점수 저장 완료");
    } catch (e) {
      console.error(e);
      alert("점수 저장 실패");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">로딩 중…</div>
      </MainLayout>
    );
  }

  const totalScore = answers.reduce((sum, q) => sum + (q.autoScore || 0), 0);

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

            const displayedOptions = type === "ox" ? ["O", "X"] : options || [];
            const correctIdx = Number(correctIndex ?? -1);
            const studentIdx =
              type === "multiple" ? Number(studentAnswer) : displayedOptions.indexOf(studentAnswer);

            // 상태 기호: 채점 완료된 경우에만 표시
            let statusSymbol = "";
            if (isGrade === 1) {
              if (autoScore === 0) statusSymbol = "／";
              else if (autoScore === maxScore) statusSymbol = "○";
              else statusSymbol = "△";
            }

            return (
              <div className="question-box" key={questionId}>
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

                <h4>{idx + 1}. {questionText}</h4>

                {type !== "subjective" ? (
                  <div className="options">
                    {displayedOptions.map((opt, i) => {
                      const isStudentAnswer =
                        type === "multiple" ? String(i) === String(studentAnswer) : opt === studentAnswer;
                      const isCorrectAnswer =
                        type === "multiple" ? i === correctIdx : opt === correctAnswer;

                       let labelClass = "option-label";
                        // 기본은 체크 해제
                        let checked = false;

                        // 채점 전에는 학생이 선택한 보기만 체크
                        if (isGrade !== 1) {
                          checked = isStudentAnswer;
                        }

                      if (isGrade === 1) {
                        // 채점 완료: 정오답에 따라 클래스와 체크 상태 만큼만 적용
                        if (isStudentAnswer && isCorrectAnswer) {
                          // 학생이 고른 게 정답일 때
                          labelClass += " correct";
                          checked = true;
                        } else if (isStudentAnswer && !isCorrectAnswer) {
                          // 학생이 고른 게 오답일 때
                          labelClass += " wrong";
                          // checked = false; (아무 것도 안 해도 false)
                        } else if (!isStudentAnswer && isCorrectAnswer) {
                          // 학생이 고르지 않았지만 이것이 정답일 때
                          labelClass += " student";
                          checked = true;
                        }
                      }

                      return (
                        <label className={labelClass} key={i}>
                          <input type="radio" checked={checked} disabled />
                          <span className="option-text">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="subjective-answer-block">
                    <label>학생 답안:</label>
                    <textarea value={studentAnswer || ""} readOnly disabled />
                    <label>정답:</label>
                    <textarea value={correctAnswer || ""} readOnly disabled />
                  </div>
                )}

                <div className="score-input-row">
                  <label>점수:</label>
                  <input
                    type="number"
                    className="score-field narrow"
                    value={autoScore}
                    min={0}
                    max={maxScore}
                    disabled={type !== "subjective"}
                    onChange={(e) => {
                      const val = Math.min(
                        maxScore,
                        Math.max(0, Number(e.target.value))
                      );
                      setAnswers((prev) =>
                        prev.map((x) =>
                          x.questionId === questionId
                            ? { ...x, autoScore: val }
                            : x
                        )
                      );
                    }}
                  />
                  <span>/ {maxScore}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="right-panel">
          <div className="timer-box">총점: {totalScore}</div>
          <button className="submit-btn" onClick={handleSave}>
            점수 저장
          </button>
          <button
            className="submit-btn return-btn"
            onClick={() => navigate(-1)}
          >
            돌아가기
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
