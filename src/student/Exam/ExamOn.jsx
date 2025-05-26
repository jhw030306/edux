import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css";

const ExamOn = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showModal, setShowModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examId = searchParams.get("examId");


  useEffect(() => {
  const fetchQuestions = async () => {
    if (!examId) return;
    try {
      const res = await fetch(`/api/exam-questions/exam/${examId}`);
      const data = await res.json();
      const sorted = data.sort((a, b) => a.number - b.number);
      setQuestions(sorted);
      setTotalCount(sorted.length);
    } catch (err) {
      console.error("시험 문제 불러오기 실패:", err);
    }
  };

  fetchQuestions();

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        navigate("/examfinish");
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [examId, navigate]);


  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(
      2,
      "0"
    );
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    let unanswered = 0;
    for (const q of questions) {
      if (!answers[q.id] && answers[q.id] !== 0)
        unanswered++;
    }
    setUnansweredCount(unanswered);
    setShowModal(true);
  };

  const confirmSubmit = () => {
    console.log("제출된 답안:", answers);
    navigate("/examfinish");
  };

  return (
    <MainLayout>
      <div className="exam-wrapper exam-on-layout">
        {/* 인터넷 패널 */}
        <div className="internet-panel">
          <iframe
            src="https://example.com"
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
            <button disabled>임시 저장</button>
            <button onClick={handleSubmit}>제출</button>
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
