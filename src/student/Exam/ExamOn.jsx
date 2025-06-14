import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css";
import axios from "axios";
import debounce from "lodash.debounce";

const ExamOn = () => {
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
  const [totalCount, setTotalCount] = useState(0);
  const [forbiddenKeys, setForbiddenKeys] = useState([]);
  const [showFocusAlert, setShowFocusAlert] =
    useState(false);
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [keyAlertMessage, setKeyAlertMessage] =
    useState("");
  const alreadyHandledRef = useRef(false);

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

    window.addEventListener("blur", handleBlur);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [examId, studentLoginId]);

  useEffect(() => {
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

    document.addEventListener(
      "mouseleave",
      handleMouseLeave
    );
    return () =>
      document.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
  }, []);

  const sendCheatLog = (detail) => {
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;
    if (!classroomId) return;

    axios.post("/api/logs/cheat", {
      studentId: studentLoginId.toString(),
      timestamp: getKSTTimeString(),
      classroomId: classroomId.toString(),
      examId: examId.toString(),
      detail,
    });
  };

  const getKSTTimeString = () => {
    const now = new Date();
    const offset = now.getTime() + 9 * 60 * 60 * 1000;
    return new Date(offset).toISOString().slice(0, 19);
  };

  const formatTime = (sec) => {
    if (sec == null) return "--:--";
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!examId || !studentId) return;

    axios
      .get("/api/logs/remaining-time", {
        params: { studentId, examInfoId: examId },
      })
      .then((res) => setTimeLeft(res.data))
      .catch((err) =>
        console.error("남은 시간 가져오기 실패:", err)
      );

    axios
      .get(`/api/exam-questions/exam/${examId}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => a.number - b.number
        );
        setQuestions(sorted);
        setTotalCount(sorted.length);
      })
      .catch((err) =>
        console.error("문제 로드 실패:", err)
      );

    axios
      .get("/api/exam-result/answers", {
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
      .catch((err) =>
        console.error("답안 로드 실패:", err)
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

  useEffect(() => {
    const handleExit = () => {
      const classroomId = JSON.parse(
        sessionStorage.getItem("selectedLecture")
      )?.id;
      const studentId = sessionStorage.getItem(
        "studentLoginid"
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
      navigator.sendBeacon("/api/logs/exit-exam", blob);
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

  const saveOne = useCallback(
    debounce((qId, ans) => {
      axios.post("/api/exam-result/save", {
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

  const logExamAction = async (type) => {
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;
    const url =
      type === "TEMP"
        ? "/api/logs/temporary-storage"
        : "/api/logs/submit-exam";
    try {
      await axios.post(url, {
        studentId: studentLoginId.toString(),
        timestamp: getKSTTimeString(),
        classroomId: classroomId.toString(),
        examId: examId.toString(),
      });
    } catch (err) {
      console.error(`[LOG] ${type} 로그 실패`, err);
    }
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
    await axios.post(
      "/api/exam-result/save/multiple",
      payload
    );
    await logExamAction("TEMP");
  };

  const confirmSubmit = async () => {
    await handleTempSave();
    await logExamAction("SUBMIT");
    localStorage.removeItem(`exam-${examId}-answers`);
    navigate("/examfinish");
  };

  const unansweredCount = questions.reduce(
    (cnt, q) =>
      answers[q.id] === undefined ? cnt + 1 : cnt,
    0
  );
  const currentQuestion = questions[currentIndex] || {};

  return (
    <MainLayout
      disableNavigation={true}
      onBlockedNavigation={(action) => {
        setShowFocusAlert(true);
        sendCheatLog(`차단된 내비게이션 시도: ${action}`);
      }}
    >
      <div className="exam-wrapper exam-on-layout">
        <div className="internet-panel">
          <div className="gcse-search"></div>
        </div>

        <div className="exam-on-content">
          <div className="top-controls">
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
          </div>

          <div className="question-box">
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

        {showModal && (
          <div className="modal">
            <div className="modal-box">
              <h2>시험 제출</h2>
              <p>정말로 시험을 제출하시겠습니까?</p>
              {unansweredCount > 0 && (
                <p>
                  남은 문제{" "}
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
      </div>
    </MainLayout>
  );
};

export default ExamOn;
