import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css";

const ExamOn = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60분 = 3600초
  const [showModal, setShowModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const dummyQuestions = [
      {
        id: 1,
        number: 1,
        type: "multiple",
        question:
          "CSS에서 스타일 우선순위가 높은 선택자는?",
        distractor: [
          "id 선택자",
          "클래스 선택자",
          "태그 선택자",
          "전체 선택자",
        ],
      },
      {
        id: 2,
        number: 2,
        type: "subjective",
        question:
          "JavaScript에서 변수를 선언하는 키워드 3가지는?",
      },
    ];
    setQuestions(dummyQuestions);
    setTotalCount(dummyQuestions.length);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/student/finish");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

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
      <div className="exam-wrapper">
        <div
          className="right-panel"
          style={{ width: "100%" }}
        >
          <div className="header">
            <div className="btns">
              <div className="timer-box">
                남은 시간: {formatTime(timeLeft)}
              </div>
              <button disabled>임시 저장</button>
              <button onClick={handleSubmit}>제출</button>
            </div>
          </div>

          <div className="question-view">
            {currentQuestion && (
              <>
                <h4>
                  {currentQuestion.number}.{" "}
                  {currentQuestion.question}
                </h4>
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
                          {opt}
                        </label>
                      )
                    )}
                  </div>
                )}
                {currentQuestion.type === "subjective" && (
                  <textarea
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

          <div className="navigator">
            <button
              disabled={currentIndex === 0}
              onClick={() =>
                setCurrentIndex(currentIndex - 1)
              }
            >
              ←
            </button>
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
            <button
              disabled={
                currentIndex === questions.length - 1
              }
              onClick={() =>
                setCurrentIndex(currentIndex + 1)
              }
            >
              →
            </button>
          </div>
        </div>

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
