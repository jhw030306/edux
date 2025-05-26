import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css";
import axios from "axios";
import debounce from "lodash.debounce"

const ExamOn = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const examId = Number(new URLSearchParams(search).get("examId"));
  const studentId = Number(sessionStorage.getItem("studentId"));

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

// 시간 포맷 (초 → MM:SS)
  const formatTime = (sec) => {
    if (sec == null) return "--:--";
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!examId || !studentId) return;

    // 1) 제한시간
    axios
      .get(`/api/exams/${examId}`)
      .then(res => {
        const durMin = res.data.duration ?? 60;
        setTimeLeft(durMin * 60);
      })
      .catch(err => console.error("제한 시간 로드 실패:", err));

    // 2) 문제
    axios.get(`/api/exam-questions/exam/${examId}`)
      .then(res => {
        const sorted = res.data.sort((a, b) => a.number - b.number);
        setQuestions(sorted);
        setTotalCount(sorted.length);  // 여기서 전체 개수를 세팅
      })
      .catch(err => console.error("문제 로드 실패:", err));

    // 3) 저장된 답안
    axios
      .get("/api/exam-result/answers", {
        params: { examId, userId: studentId }
      })
      .then(res => {
        const init = {};
        res.data.forEach(item => {
          const ua = item.userAnswer;
          // 주관식 빈 문자열은 무응답으로 처리
          if (typeof ua === "string" && ua.trim() === "") return;
          // 객관식 숫자형 문자열은 Number로
          init[item.examQuestionId] =
            /^[0-9]+$/.test(ua) ? Number(ua) : ua;
        });
        setAnswers(init);
      })
      .catch(err => console.error("답안 로드 실패:", err));
  }, [examId, studentId]);


  // ────────────────────────────────────────────────────────
  // B) 타이머: timeLeft 세팅되면 1초마다 감소
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft == null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);


  // 자동 저장 (debounce)
  const saveOne = useCallback(
    debounce((qId, ans) => {
      axios
        .post("/api/exam-result/save", {
          examId,
          userId: studentId,
          examQuestionId: qId,
          userAnswer: ans,
        })
        .catch(e => console.error("Draft 저장 실패:", e));
    }, 500),
    [examId, studentId]
  );


  // 답안 선택/입력 처리
  const handleAnswer = (qId, val) => {
    setAnswers(prev => {
      const next = { ...prev };
      // 주관식 빈 문자열이면 삭제 → 무응답 처리
      if (typeof val === "string" && val.trim() === "") {
        delete next[qId];
      } else {
        next[qId] = val;
      }
      saveOne(qId, val);
      return next;
    });
  };


  // 임시 저장 (batch)
  const handleTempSave = async () => {
    saveOne.flush();
    const payload = {
      examId,
      userId: studentId,
      answers: Object.entries(answers)
        .map(([qid, ans]) => ({
          examQuestionId: qid.toString(),
          userAnswer: ans.toString(),
        }))
        .filter(a => a.userAnswer !== "")
    };
    await axios.post("/api/exam-result/save/multiple", payload);
  };


  // 최종 제출
  const confirmSubmit = async () => {
    await handleTempSave();
    navigate("/examfinish");
  };


  // 미응답 개수 계산
  const unansweredCount = questions.reduce((cnt, q) => {
    return answers[q.id] === undefined ? cnt + 1 : cnt;
  }, 0);

   // 현재 문제
  const currentQuestion = questions[currentIndex] || {};

  return (
    <MainLayout>
      <div className="exam-wrapper exam-on-layout">
        {/* 인터넷 패널 */}
        <div className="internet-panel">
          <iframe
            src="https://google.com"
            title="internet"
            className="internet-iframe"
          />
        </div>

        {/* 시험 영역 */}
        <div className="exam-on-content">
          <div className="top-controls">
            <div className="timer-box">
              남은 시간: {formatTime(timeLeft)}
            </div>
            <button className="submit-btn" 
            onClick={handleTempSave}>
              임시 저장</button>
             <button className="submit-btn" 
             onClick={() => setShowModal(true)}>
              제출</button>
          </div>

          <div className="question-box">
            {currentQuestion && (
              <>
                <h4>
                  {currentQuestion.number}.{" "}
                  {currentQuestion.question}
                </h4>

                {/* 객관식 */}
                {currentQuestion.type === "multiple" && (
                  <div className="options">
                    {currentQuestion.distractor.map(
                      (opt, idx) => (
                        <label key={idx}>
                          <input
                            type="radio"
                            name={`q-${currentQuestion.id}`}
                            checked={
                              answers[
                                currentQuestion.id
                              ] === idx
                            }
                            onChange={() =>
                              handleAnswer(
                                currentQuestion.id,
                                idx
                              )
                            }
                          />
                          <strong>{idx + 1}.</strong> {opt}
                        </label>
                      )
                    )}
                  </div>
                )}

                {/* OX형 */}
                {currentQuestion.type === "ox" && (
                  <div className="options">
                    {["O", "X"].map((opt) => (
                      <label key={opt}>
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id] === opt}
                          onChange={() =>
                            handleAnswer(currentQuestion.id, opt)
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* 주관식 */}
                {currentQuestion.type === "subjective" && (
                  <textarea
                    style={{ textAlign: "left" }}
                    value={
                      answers[currentQuestion.id] || ""
                    }
                    onChange={(e) =>
                      handleAnswer(
                        currentQuestion.id,
                        e.target.value
                      )
                    }
                  />
                )}
              </>
            )}
          </div>

          <div className="answer-sheet">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`num-btn ${
                  idx === currentIndex ? "active" : ""
                } ${
                  answers[q.id] != null ? "answered" : ""
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 제출 모달 */}
        {showModal && (
          <div className="modal">
            <div className="modal-box">
              <h2>시험 제출</h2>
              <p>정말로 시험을 제출하시겠습니까?</p>
              {unansweredCount > 0 && (
                <p>
                  남은 문제&nbsp;
                  <strong>
                    {unansweredCount}/{totalCount}
                  </strong>
                </p>
              )}
              <div className="delete-buttons">
                <button
                  className="submit-btn"
                  onClick={confirmSubmit}
                >
                  제출
                </button>
                <button
                  className="submit-btn"
                  style={{
                    backgroundColor: "#ccc",
                    color: "#333",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExamOn;
