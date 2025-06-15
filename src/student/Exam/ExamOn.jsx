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
import debounce from "lodash.debounce"
import.meta.env.VITE_API_URL

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
  const location = useLocation();

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
  const iframeRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isViewingIframe = historyIndex >= 0;
  const [showBlockAlert, setShowBlockAlert] = useState(false);
  const [blockAlertMessage, setBlockAlertMessage] = useState("");
  const [forbiddenDomains, setForbiddenDomains] = useState([]);



  //금지 사이트 목록 받아오기
  useEffect(() => {
    if (!examId) return;

    api.get(`/exam-range/${examId}`)
      .then((res) => {
        const { mode, rangeDetails } = res.data;
        console.log("📛 금지 도메인 받아옴:", rangeDetails);  // 🔍 여기 추가
        setForbiddenDomains((rangeDetails || []).filter((url) => {
          try {
            new URL(url);
            return true;
          } catch {
            console.warn("🚫 잘못된 금지 도메인 URL 무시:", url);
            return false;
          }
        }));

      })
      .catch((err) => {
        if (err.response?.status === 404) {
          console.warn("❗ 금지 도메인 없음");
          setForbiddenDomains([]);
        } else {
          console.error("금지 도메인 정보 불러오기 실패", err);
        }
      });
  }, [examId]);


  // 최초 한 번만 JSON 파일에서 키 목록 불러오기
  useEffect(() => {
    fetch("/forbiddenKeys.json")
      .then((res) => res.json())
      .then((data) => {
        setForbiddenKeys(data);
        console.log("📥 금지 키 불러옴:", data);
      })
      .catch((err) => {
        console.error("금지 키 불러오기 실패:", err);
      });
  }, []);
useEffect(() => {
  if (!currentUrl) return;

  try {
    const url = new URL(currentUrl);
    const targetHost = url.hostname;

    const isBlocked = forbiddenDomains.some((domain) => {
      const blockedHost = new URL(domain).hostname;
      return targetHost === blockedHost || targetHost.endsWith("." + blockedHost);
    });

    if (isBlocked) {
      console.warn("⛔ iframe 로딩 차단됨:", currentUrl);
      setCurrentUrl(""); // iframe 로딩 막기
      setBlockAlertMessage("🚫 금지된 사이트입니다.");
      setShowBlockAlert(true);
      sendCheatLog(`iframe 차단 대상 URL 로딩 시도: ${currentUrl}`);
    }
  } catch (e) {
    console.warn("iframe URL 검사 실패:", e);
  }
}, [currentUrl, forbiddenDomains]);

  // GSE 검색 결과 클릭 → iframe에 로드
  useEffect(() => {
const handleClick = (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  e.preventDefault();

  let url = link.href;
  const parsed = new URL(url);
  if (parsed.hostname === "www.google.com" && parsed.searchParams.has("q")) {
    url = parsed.searchParams.get("q");
  }

  console.log("✅ 클릭한 실제 URL:", url);

  const isBlocked = forbiddenDomains.some((domain) => {
    try {
      const blockedHost = new URL(domain).hostname;
      const targetHost = new URL(url).hostname;
      return targetHost === blockedHost || targetHost.endsWith("." + blockedHost);
    } catch {
      return false;
    }
  });

  if (isBlocked) {
    console.warn("🚫 금지된 도메인이므로 차단:", url);
    setBlockAlertMessage("🚫 금지된 사이트에 접근할 수 없습니다.");
    setShowBlockAlert(true);
    sendCheatLog(`금지된 사이트 접근 시도: ${url}`);
    return; // 🔴 이걸 꼭 유지해야 iframe으로 안 감!
  }

  // 허용된 경우만 iframe에 반영
  const newStack = [...historyStack.slice(0, historyIndex + 1), url];
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    setCurrentUrl(url);
  };

    const observer = new MutationObserver(() => {
      document
        .querySelectorAll(".gsc-resultsbox-visible a[target='_blank']")
        .forEach((a) => (a.target = ""));
    });

// 링크 제어 코드 (이미 있는 observer에서 강화)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    document.querySelectorAll(".gsc-resultsbox-visible a[target='_blank']").forEach((a) => {
      a.target = ""; // 새 창으로 안 뜨게
      a.addEventListener("click", handleClick, { once: true }); // ✅ 강제로 제어
    });

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      observer.disconnect();
    };
  }, [historyStack, historyIndex]);


  //앞으로가기, 뒤로가기
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(historyStack[newIndex]);
    } else {
      setHistoryIndex(-1); // ✅ 검색창 모드로 전환됨
      setCurrentUrl("");
    }
  };

  const goForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(historyStack[newIndex]);
    }
  };



  //금지키
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

  // //창 전환 감지
  // useEffect(() => {
  //   const handleBlur = () => {
  //     if (alreadyHandledRef.current) return;
  //     alreadyHandledRef.current = true;

  //     setShowFocusAlert(true);
  //     sendCheatLog("시험 창 포커스 이탈");
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.hidden && !alreadyHandledRef.current) {
  //       alreadyHandledRef.current = true;

  //       setShowFocusAlert(true);
  //       sendCheatLog(
  //         "시험 창 탭 전환 또는 창 숨김 감지 이탈"
  //       );
  //     }
  //   };

  //   window.addEventListener("blur", handleBlur);
  //   document.addEventListener(
  //     "visibilitychange",
  //     handleVisibilityChange
  //   );

  //   return () => {
  //     window.removeEventListener("blur", handleBlur);
  //     document.removeEventListener(
  //       "visibilitychange",
  //       handleVisibilityChange
  //     );
  //   };
  // }, [examId, studentLoginId]);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      // 마우스가 브라우저 창 경계를 벗어났는지 확인
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
    return () => {
      document.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, []);

  //로그 전송용용
  const sendCheatLog = (detail) => {
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;
    if (!classroomId) return;


    api.post("/logs/cheat", {
      studentId: studentLoginId.toString(),
      timestamp: getKSTTimeString(),
      classroomId: classroomId.toString(),
      examId: examId.toString(),
      detail: detail
    }).then(() => {
      console.log("[LOG] 부정행위 로그 전송 완료:", detail);
    }).catch((err) => {
      console.error("[LOG] 부정행위 로그 전송 실패:", err);
    });

  };

  // 시간 포맷 (초 → MM:SS)
  const formatTime = (sec) => {
    if (sec == null) return "--:--";
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  //한국 시간
  const getKSTTimeString = () => {
    const now = new Date();
    const offset = now.getTime() + 9 * 60 * 60 * 1000;
    return new Date(offset).toISOString().slice(0, 19);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cse.google.com/cse.js?cx=950d9d6628e044643";
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

    api.get("/logs/remaining-time", {
      params: {
        studentId,
        examInfoId: examId
      }
    })
      .then(res => {
        setTimeLeft(res.data); // 초 단위로 받아옴
        console.log("🕒 남은 시간 설정됨:", res.data);
      })
      .catch((err) =>
        console.error("남은 시간 가져오기 실패:", err)
      );

    // 2) 문제

    api.get(`/exam-questions/exam/${examId}`)
      .then(res => {
        const sorted = res.data.sort((a, b) => a.number - b.number);

        setQuestions(sorted);
        setTotalCount(sorted.length); // 여기서 전체 개수를 세팅
      })
      .catch((err) =>
        console.error("문제 로드 실패:", err)
      );

    // 3) 저장된 답안

    api
      .get("/exam-result/answers", {
        params: { examId, userId: studentId }

      })
      .then((res) => {
        const init = {};
        res.data.forEach((item) => {
          const ua = item.userAnswer;
          // 주관식 빈 문자열은 무응답으로 처리
          if (typeof ua === "string" && ua.trim() === "")
            return;
          // 객관식 숫자형 문자열은 Number로
          init[item.examQuestionId] = /^[0-9]+$/.test(ua)
            ? Number(ua)
            : ua;
        });
        setAnswers(init);
      })
      .catch((err) =>
        console.error("답안 로드 실패:", err)
      );
  }, [examId, studentId]);

  // ────────────────────────────────────────────────────────
  // B) 타이머: timeLeft 세팅되면 1초마다 감소
  // ────────────────────────────────────────────────────────
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
      const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
      const studentId = sessionStorage.getItem("studentLoginId");


      if (!studentId || !classroomId || !examId) return; // 데이터 없을 때 방지

      const payload = {
        studentId: studentId.toString(),
        timestamp: getKSTTimeString(), // ✅ UTC가 아니라 KST
        classroomId: classroomId.toString(),
        examId: examId.toString(),
      };

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      console.log("📤 EXAM_EXIT 로그 전송 (페이지 이탈)");
      navigator.sendBeacon(`${import.meta.env.VITE_API_URL}/logs/exit-exam`, blob);
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
  }, []); // ✅ 의존성 제거해서 컴포넌트 마운트 시 한 번만 실행

  // 자동 저장 (debounce)
  const saveOne = useCallback(
    debounce((qId, ans) => {
      api
        .post("/exam-result/save", {
          examId,
          userId: studentId,
          examQuestionId: qId,
          userAnswer: ans,
        })
        .catch((e) => console.error("Draft 저장 실패:", e));
    }, 500),
    [examId, studentId]
  );

  //시험 제출 및 저장시 로그 기록
  const logExamAction = async (type) => {
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;

    const url =
      type === "TEMP"
        ? `${import.meta.env.VITE_API_URL}/logs/temporary-storage`
        : `${import.meta.env.VITE_API_URL}/logs/submit-exam`;

    try {
      await api.post(url, {
        studentId: studentLoginId.toString(), // ✅ 문자열로 변환
        timestamp: getKSTTimeString(), // ✅ UTC가 아니라 KST
        classroomId: classroomId.toString(), // ✅ 꼭 문자열
        examId: examId.toString(),
      });

      console.log(
        `[LOG] ${
          type === "TEMP" ? "임시 저장" : "시험 제출"
        } 로그 전송 완료`
      );
    } catch (err) {
      console.error(
        `[LOG] ${
          type === "TEMP" ? "임시 저장" : "시험 제출"
        } 로그 실패`,
        err
      );
    }
  };

  // 답안 선택/입력 처리
  const handleAnswer = (qId, val) => {
    setAnswers((prev) => {
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
        .filter((a) => a.userAnswer !== ""),
    };

    await api.post("/exam-result/save/multiple", payload);
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
        <div className={`internet-panel ${isViewingIframe ? "iframe-mode" : "search-mode"}`}>
          {/* 검색창 */}
          <div className="search-box">
            <div className="gcse-search"></div>
          </div>

          {/* 결과 iframe */}
          <div className="iframe-box">
            <div className="iframe-controls">
              <button onClick={goBack}>◀ 뒤로</button>
              <button onClick={goForward} disabled={historyIndex >= historyStack.length - 1}>▶ 앞으로</button>
            </div>
            <iframe
              ref={iframeRef}
              src={currentUrl || undefined}
              className="result-iframe"
              title="검색 결과 보기"
            ></iframe>
          </div>
        </div>


        {/* 시험 영역 */}
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
                  setShowKeyAlert(false); // ✅ 이거!
                  alreadyHandledRef.current = false;
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {showBlockAlert && (
        <div className="modal">
          <div className="modal-box">
            <h2>⚠ 금지된 사이트</h2>
            <p>{blockAlertMessage}</p>
            <div className="delete-buttons">
              <button
                className="submit-btn"
                onClick={() => {
                  setShowBlockAlert(false);
                  setBlockAlertMessage("");
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

export default ExamOn;
