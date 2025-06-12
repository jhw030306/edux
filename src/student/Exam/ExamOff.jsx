import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css"; // 기존 공통 스타일 포함
import api from "../../api/axios";
import debounce from "lodash.debounce";

const ExamOff = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const examId = Number(new URLSearchParams(search).get("examId"));
  const studentId = Number(sessionStorage.getItem("studentId"));

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});      // { [questionId]: studentAnswer }
  const [currentIndex, setCurrentIndex] = useState(0);

  //초기값 null로 두고 서버에서 받아온 duration으로 다시 세팅
  const [timeLeft, setTimeLeft] = useState(null); 
  const [showModal, setShowModal] = useState(false);


  // 시간 포맷 함수 (초 → "MM:SS")
  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // 1) 문제 + 저장된 학생 답안 불러오기 & 타이머
  useEffect(() => {
    if (!examId || !studentId) return;
    
    // 시험 제한 시간(duration) 불러오기
    api
      .get(`/exams/${examId}`)
      .then((res) => {
        const durMin = res.data.duration ?? 60;       // 서버에서 내려온 분 단위
        setTimeLeft(durMin * 60);                     // 초 단위로 변환
      })
      .catch((e) => console.error("제한 시간 불러오기 실패:", e));

    // 문제만 
    api
      .get(`/exam-questions/exam/${examId}`)
      .then((res) => setQuestions(res.data.sort((a, b) => a.number - b.number)))
      .catch((e) => console.error("문제 불러오기 실패:", e));

    // 저장된 학생 답안만
    api
    .get("/exam-result/answers", { params: { examId, userId: studentId } })
    .then((res) => {
      const init = {};
      res.data.forEach((item) => {
        const ua = item.userAnswer;
        // 주관식(userAnswer가 빈 문자열)이면 무응답 처리
        if (typeof ua === "string" && ua.trim() === "") {
          return;
        }
        // 객관식 숫자는 Number로 변환
        init[item.examQuestionId] =
          /^[0-9]+$/.test(ua) ? Number(ua) : ua;
      });
      setAnswers(init);
    })
      .catch((e) => console.error("답안 불러오기 실패:", e));
      }, [examId, studentId]);

    
//  타이머 전용: timeLeft가 null이 아니면 1초마다 감소
useEffect(() => {
  if (timeLeft === null) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
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

  // 자동 저장 (debounced)
  const saveOne = useCallback(
    debounce((qId, ans) => {
      api.post("/exam-result/save", {
        examId,
        userId: studentId,
        examQuestionId: qId,
        userAnswer: ans,
      }).catch((e) => console.error("Draft 저장 실패:", e));
    }, 500),
    [examId, studentId]
  );


  const handleAnswer = (qId, val) => {
   setAnswers((prev) => {
     const next = { ...prev };
     // 주관식 textarea 가 비워지면 무응답 처리
     if (typeof val === "string" && val.trim() === "") {
       delete next[qId];
     } else {
       next[qId] = val;
     }
     saveOne(qId, val);
     return next;
   });
 };
  // 3) 임시 저장 (batch)
  const handleTempSave = async () => {
    saveOne.flush();
    const payload = {
   examId,
   userId: studentId,
   answers: Object.entries(answers)
     .map(([qid, ans]) => ({
       examQuestionId: qid.toString(),     // String 타입으로
       userAnswer: ans.toString(),         // String 타입으로
     }))
     .filter(a => a.userAnswer !== ""),     // 빈 답안은 보내지 않아도 좋습니다
 };
 await api.post("/exam-result/save/multiple", payload);
};

  // 4) 최종 제출
  const confirmSubmit = async () => {
    await handleTempSave();
    navigate("/examfinish");
  };

  const currentQuestion = questions[currentIndex] || {};
  const unansweredCount = questions.reduce((cnt, q) => {
   const a = answers[q.id];
   // 숫자(0)이나 "O"/"X"도 valid, 빈 문자열·undefined만 무응답
   if (a === undefined) return cnt + 1;
   return cnt;
 }, 0);

  return (
    <MainLayout>
      <div className="exam-wrapper exam-off-layout">
        <div className="exam-panels">
          {/* 좌측 문제 영역 */}
          <div className="left-panel">
            {currentQuestion && (
              <div className="question-box">
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
                          checked={
                            answers[currentQuestion.id] === opt
                          }
                          onChange={() =>
                            handleAnswer(
                              currentQuestion.id,
                              opt
                            )
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
              </div>
            )}
          </div>

          {/* 우측 패널 (타이머, 버튼, 답안 시트) */}
          <div className="right-panel">
            <div className="timer-box">
              남은 시간: {formatTime(timeLeft)}
            </div>
            <button className="submit-btn" onClick={handleTempSave}>
              임시 저장
            </button>
            <button className="submit-btn" onClick={() => setShowModal(true)}>
              제출
            </button>

            <div className="answer-sheet">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`num-btn ${
                    idx === currentIndex ? "active" : ""
                  } ${
                    answers[q.id] !== undefined ? "answered" : ""
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

      {/* 제출 확인 모달 */}
      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>시험 제출</h2>
            <p>정말로 시험을 제출하시겠습니까?</p>
            {unansweredCount > 0 && (
              <p>
                미응답 문제:{" "}
                <strong>
                  {unansweredCount}/{questions.length}
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
    </MainLayout>
  );
};

export default ExamOff;
