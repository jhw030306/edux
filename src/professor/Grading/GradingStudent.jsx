import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import axios from "axios";
import "./GradingStudent.css";

export default function GradingStudent() {
  const { student, examId } = useLocation().state || {};
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 전체 데이터 불러오기
  const fetchFull = async () => {
    const { data: full } = await axios.get("/api/grading/full", {
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

  // 서술형 점수 저장
  const handleSave = async () => {
    try {
      const toSave = answers.filter((q) => q.type === "subjective");
      await Promise.all(
        toSave.map((q) =>
          axios.post("/api/grading/grade", {
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

  // 전체 총점 계산
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
              studentAnswer,
              autoScore,
              maxScore,
            } = q;

            // 객관식용 인덱스
            const correctIdx = options.indexOf(correctAnswer);
            // 학생 인덱스 (multiple 은 인덱스 값으로)
            let studentIdx = -1;
            if (type === "multiple") {
              studentIdx = Number(studentAnswer);
            } else {
              studentIdx = options.indexOf(studentAnswer);
            }

            // 상태 기호: 0점 → ／, 일부 점수 → △, 만점 → ○
            let statusSymbol = autoScore === 0 ? "／"
                              : autoScore === maxScore ? "○"
                              : "△";

            return (
              <div className="question-box" key={questionId}>
                {/* 절대 위치된 상태 심볼 */}
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

                {/* 질문 헤더 */}
                <h4>{idx + 1}. {questionText}</h4>

                {/* 객관식 / OX */}
                {type !== "subjective" ? (
                  <div className="options">
                    {options.map((opt, i) => {
                      const isStudent = i === studentIdx;
                      const isCorrect = i === correctIdx;

                      // 기본 클래스
                      let labelClass = "option-label";
                      let checked    = false;

                      if (autoScore === 0) {
                        // 틀린 문제
                        if (isStudent) {
                          // 학생 오답: 회색 배경 + 체크
                          labelClass += " student-selected";
                          checked    = true;
                        }
                        if (isCorrect) {
                          // 교수 정답: 빨간 배경
                          labelClass += " wrong-answer";
                        }
                      } else {
                        // 맞힌 문제 (autoScore > 0)
                        if (isStudent && isCorrect) {
                          // 학생이 맞힌 정답: 파란 배경 + 테두리 + 체크
                          labelClass += " correct-border";
                          checked    = true;
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
                  // 서술형
                  <div className="subjective-answer-block">
                    <label>학생 답안:</label>
                    <textarea value={studentAnswer || ""} readOnly disabled />
                    <label>정답:</label>
                    <textarea value={correctAnswer || ""} readOnly disabled />
                  </div>
                )}

                {/* 점수 입력 */}
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

        {/* 우측 패널: 총점 및 버튼 */}
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
