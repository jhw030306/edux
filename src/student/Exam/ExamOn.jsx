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
  const studentLoginId = sessionStorage.getItem("studentLoginId");
  const location = useLocation();

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
  const script = document.createElement("script");
  script.src = "";
  script.async = true;
  document.body.appendChild(script);

  // 검색창이 다시 렌더링 되도록 기존 내용 제거 (없어도 되긴 함)
  return () => {
    document.body.removeChild(script);
  };
}, []);


  useEffect(() => {
    if (!examId || !studentId) return;

    // 1) 제한시간
    // 남은 시간 API 호출
    axios.get("/api/logs/remaining-time", {
      params: {
        studentId,
        examInfoId: examId
      }
    })
      .then(res => {
        setTimeLeft(res.data); // 초 단위로 받아옴
        console.log("🕒 남은 시간 설정됨:", res.data);
      })
      .catch(err => console.error("남은 시간 가져오기 실패:", err));


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

  useEffect(() => {
    const handleExit = () => {
      const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
      const studentId = sessionStorage.getItem("studentLoginId");

      if (!studentId || !classroomId || !examId) return; // 데이터 없을 때 방지

      const payload = {
        studentId: studentId.toString(),
        timestamp: new Date().toISOString().slice(0, 19),
        classroomId: classroomId.toString(),
        examId: examId.toString(),
      };

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      console.log("📤 EXAM_EXIT 로그 전송 (페이지 이탈)");
      navigator.sendBeacon("/api/logs/exit-exam", blob);
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("popstate", handleExit);

    return () => {
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("popstate", handleExit);
    };
  }, []); // ✅ 의존성 제거해서 컴포넌트 마운트 시 한 번만 실행

  const goToAnotherPage = () => {
    logExamExit();  // 직접 로그 함수 호출
    navigate("/somewhere");
  };





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

  //시험 제출 및 저장시 로그 기록
  const logExamAction = async (type) => {
    const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
    
    const url =
      type === "TEMP"
        ? "/api/logs/temporary-storage"
        : "/api/logs/submit-exam";

    try {
      await axios.post(url, {
        studentId: studentLoginId.toString(), // ✅ 문자열로 변환
        timestamp: new Date().toISOString().slice(0, 19),
        classroomId: classroomId.toString(), // ✅ 꼭 문자열
        examId: examId.toString()
      });

      console.log(`[LOG] ${type === "TEMP" ? "임시 저장" : "시험 제출"} 로그 전송 완료`);
    } catch (err) {
      console.error(`[LOG] ${type === "TEMP" ? "임시 저장" : "시험 제출"} 로그 실패`, err);
    }
  };



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
    await logExamAction("TEMP"); // ✅ 임시 저장 로그 남기기
  };


  // 최종 제출
  const confirmSubmit = async () => {
    await handleTempSave();
    await logExamAction("SUBMIT"); // ✅ 제출 로그 남기기
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

          <div className="gcse-search"></div>
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
