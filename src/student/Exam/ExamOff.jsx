import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css";
import api from "../../api/axios";
import debounce from "lodash.debounce";

const ExamOff = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const examId = Number(
    new URLSearchParams(search).get("examId")
  );
  const studentId = Number(
    sessionStorage.getItem("studentId")
  );
  const studentLoginId = sessionStorage.getItem(
    "studentLoginId"
  );

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFocusAlert, setShowFocusAlert] =
    useState(false);
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [keyAlertMessage, setKeyAlertMessage] =
    useState("");
  const [forbiddenKeys, setForbiddenKeys] = useState([]);
  const alreadyHandledRef = useRef(false);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const getKSTTimeString = () => {
    const now = new Date();
    const offset = now.getTime() + 9 * 60 * 60 * 1000;
    return new Date(offset).toISOString().slice(0, 19);
  };

  const sendCheatLog = (detail) => {
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;
    if (!classroomId || !studentLoginId) return;
    api.post("/logs/cheat", {
      studentId: studentLoginId.toString(),
      timestamp: getKSTTimeString(),
      classroomId: classroomId.toString(),
      examId: examId.toString(),
      detail,
    });
  };

  useEffect(() => {
    fetch("/forbiddenKeys.json")
      .then((res) => res.json())
      .then((data) => setForbiddenKeys(data))
      .catch((err) =>
        console.error("금지 키 불러오기 실패:", err)
      );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyCombo = [];
      if (e.ctrlKey) keyCombo.push("Control");
      if (e.shiftKey) keyCombo.push("Shift");
      if (e.altKey) keyCombo.push("Alt");
      keyCombo.push(e.key);
      const comboString = keyCombo.join("+");

      const matched = forbiddenKeys.find(
        (f) => f.key === e.key || f.key === comboString
      );

      if (matched) {
        e.preventDefault();
        setKeyAlertMessage(
          `금지된 키 입력입니다: ${matched.label}`
        );
        setShowKeyAlert(true);
        sendCheatLog(`금지 키 입력: ${matched.key}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [forbiddenKeys, examId, studentLoginId]);

  useEffect(() => {
    const handleBlur = () => {
      if (alreadyHandledRef.current) return;
      alreadyHandledRef.current = true;
      setShowFocusAlert(true);
      sendCheatLog("시험 창 포커스 이탈");
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !alreadyHandledRef.current) {
        alreadyHandledRef.current = true;
        setShowFocusAlert(true);
        sendCheatLog(
          "시험 창 탭 전환 또는 창 숨김 감지 이탈"
        );
      }
    };

    const handleMouseLeave = (e) => {
      const outTop = e.clientY <= 0;
      const outLeft = e.clientX <= 0;
      const outRight = e.clientX >= window.innerWidth;
      const outBottom = e.clientY >= window.innerHeight;

      if (
        (outTop || outLeft || outRight || outBottom) &&
        !alreadyHandledRef.current
      ) {
        alreadyHandledRef.current = true;
        setShowFocusAlert(true);
        sendCheatLog("마우스가 창 밖으로 벗어남");
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    document.addEventListener(
      "mouseleave",
      handleMouseLeave
    );
    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      document.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, [examId, studentLoginId]);

  useEffect(() => {
    const handleExit = () => {
      const classroomId = JSON.parse(
        sessionStorage.getItem("selectedLecture")
      )?.id;
      const studentId = sessionStorage.getItem(
        "studentLoginId"
      );
      if (!studentId || !classroomId || !examId) return;

      const payload = {
        studentId: studentId.toString(),
        timestamp: getKSTTimeString(),
        classroomId: classroomId.toString(),
        examId: examId.toString(),
      };

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon("/logs/exit-exam", blob);
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("popstate", handleExit);
    return () => {
      window.removeEventListener(
        "beforeunload",
        handleExit
      );
      window.removeEventListener("popstate", handleExit);
    };
  }, []);

  useEffect(() => {
    if (!examId || !studentId) return;

    api
      .get(`/exams/${examId}`)
      .then((res) => {
        const durMin = res.data.duration ?? 60;
        setTimeLeft(durMin * 60);
      })
      .catch((e) =>
        console.error("제한 시간 불러오기 실패:", e)
      );

    api
      .get(`/exam-questions/exam/${examId}`)
      .then((res) =>
        setQuestions(
          res.data.sort((a, b) => a.number - b.number)
        )
      )
      .catch((e) =>
        console.error("문제 불러오기 실패:", e)
      );

    api
      .get("/exam-result/answers", {
        params: { examId, userId: studentId },
      })
      .then((res) => {
        const init = {};
        res.data.forEach((item) => {
          const ua = item.userAnswer;
          if (typeof ua === "string" && ua.trim() === "")
            return;
          init[item.examQuestionId] = /^[0-9]+$/.test(ua)
            ? Number(ua)
            : ua;
        });

        const saved = localStorage.getItem(
          `exam-${examId}-answers`
        );
        if (saved) {
          try {
            const localAnswers = JSON.parse(saved);
            Object.assign(init, localAnswers);
          } catch (e) {
            console.warn("localStorage parsing 오류", e);
          }
        }

        setAnswers(init);
      })
      .catch((e) =>
        console.error("답안 불러오기 실패:", e)
      );
  }, [examId, studentId]);

  useEffect(() => {
    if (timeLeft == null) return;
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

  const saveOne = useCallback(
    debounce((qId, ans) => {
      api.post("/exam-result/save", {
        examId,
        userId: studentId,
        examQuestionId: qId,
        userAnswer: ans,
      });
    }, 500),
    [examId, studentId]
  );

  const handleAnswer = (qId, val) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (typeof val === "string" && val.trim() === "") {
        delete next[qId];
      } else {
        next[qId] = val;
      }
      localStorage.setItem(
        `exam-${examId}-answers`,
        JSON.stringify(next)
      );
      saveOne(qId, val);
      return next;
    });
  };

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
        .filter((a) => a.userAnswer !== ""),
    };
    await api.post("/exam-result/save/multiple", payload);
  };

  const confirmSubmit = async () => {
    await handleTempSave();
    localStorage.removeItem(`exam-${examId}-answers`);
    navigate("/examfinish");
  };

  const currentQuestion = questions[currentIndex] || {};
  const unansweredCount = questions.reduce((cnt, q) => {
    return answers[q.id] === undefined ? cnt + 1 : cnt;
  }, 0);

  return (
    <MainLayout
      disableNavigation={true}
      onBlockedNavigation={(action) => {
        setShowFocusAlert(true);
        sendCheatLog(`차단된 내비게이션 시도: ${action}`);
      }}
    >
      <div className="exam-wrapper exam-off-layout">
        <div className="exam-off-panels">
          <div className="left-panel">
            {currentQuestion && (
              <div className="question-box">
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
                          <strong>{idx + 1}.</strong> {opt}
                        </label>
                      )
                    )}
                  </div>
                )}
                {currentQuestion.type === "ox" && (
                  <div className="options">
                    {["O", "X"].map((opt) => (
                      <label key={opt}>
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          checked={
                            answers[currentQuestion.id] ===
                            opt
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
          <div className="right-panel">
            <div className="timer-box">
              남은 시간: {formatTime(timeLeft)}
            </div>
            <button
              className="submit-btn"
              onClick={handleTempSave}
            >
              임시 저장
            </button>
            <button
              className="submit-btn"
              onClick={() => setShowModal(true)}
            >
              제출
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
          </div>
        </div>
      </div>

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

      {showFocusAlert && (
        <div className="modal">
          <div className="modal-box">
            <h2>⚠ 창 이탈 감지</h2>
            <p>
              시험 중에는 다른 창으로 이동할 수 없습니다.
            </p>
            <div className="delete-buttons">
              <button
                className="submit-btn"
                onClick={() => {
                  setShowFocusAlert(false);
                  alreadyHandledRef.current = false;
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeyAlert && (
        <div className="modal">
          <div className="modal-box">
            <h2>⚠ 금지된 키 입력</h2>
            <p>{keyAlertMessage}</p>
            <div className="delete-buttons">
              <button
                className="submit-btn"
                onClick={() => {
                  setShowKeyAlert(false);
                  alreadyHandledRef.current = false;
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ExamOff;
