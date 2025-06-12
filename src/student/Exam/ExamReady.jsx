// src/student/Exam/ExamReady.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamReady.css";

const ExamReady = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examId = searchParams.get("examId");

  const [examInfo, setExamInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!examId) return;
    const fetchExamInfo = async () => {
      try {
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok) throw new Error("시험 정보 불러오기 실패");
        const data = await res.json();
        setExamInfo(data);
        console.log("📦 examInfo 응답:", data);

      } catch (err) {
        console.error(err);
        alert("시험 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchExamInfo();
  }, [examId]);
  

  useEffect(() => {
    if (!examInfo) return;

    const start = new Date(examInfo.testStartTime).getTime();
    const end = new Date(examInfo.testEndTime).getTime();
    let timer;
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((start - now) / 1000));
      setTimeLeft(diff);
      
      if (diff <= 0) {
        clearInterval(timer);

        // ↓ 실제 mode 필드 이름에 맞춰 변경
        const mode = examInfo.mode;           
        const isDenied = mode === "deny";      //deny면 exmaOff로 나머진 examOn

      } if (now > end) {
      setIsExpired(true); // 시험 종료됨
      clearInterval(timer);
    }

    };
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [examInfo]);

  const formatTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}일`);
    if (hours > 0 || days > 0) parts.push(`${hours}시간`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}분`);
    parts.push(`${seconds}초`);

    return parts.join(" ");
  };


  if (!examInfo) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      <div className="exam-ready">
        <div className="exam-ready-box">
          <h2>{examInfo.className}</h2>
          <h1>{examInfo.title}</h1>

          <div className="timer">
            {timeLeft !== null
              ? formatTime(timeLeft)
              : "Loading..."}
          </div>

          <div className="notice-box">
            {examInfo.notice ? (
              <pre style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
                {examInfo.notice}
              </pre>
            ) : (
              <p>공지사항이 없습니다.</p>
            )}
          </div>


          <button
            className="start-button"
            disabled={timeLeft > 0 || isExpired} // 시작 전이거나 시험 끝났으면 비활성화
            onClick={async () => {
              try {
                const studentId = sessionStorage.getItem("studentLoginId");
                const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
                const res = await fetch(
                  `/api/logs/exam-status?studentId=${studentId}&examInfoId=${examInfo.id}&classroomId=${classroomId}`
                );

                if (!res.ok) throw new Error("시험 상태 확인 실패");
                const status = await res.text();
                console.log("🧾 시험 상태 응답:", status); // ← 여기 추가!

                if (status === "BEFORE") {
                  const mode = examInfo.mode;
                  const isDenied = mode === "deny";
                  navigate(
                    isDenied
                      ? `/examoff?examId=${examInfo.id}`
                      : `/examon?examId=${examInfo.id}`
                  );
                } else if (status === "IN_PROGRESS") {
                  alert("시험 입장 기록이 있습니다. 부정행위로 감지 될 수 있습니다.");
                  const mode = examInfo.mode;
                  const isDenied = mode === "deny";
                  navigate(
                    isDenied
                      ? `/examoff?examId=${examInfo.id}`
                      : `/examon?examId=${examInfo.id}`
                  );
                } else if (status === "FINISHED") {
                  alert("시험 제출이 완료된 상태입니다.");
                } else {
                  alert("알 수 없는 시험 상태입니다.");
                }
              } catch (err) {
                console.error(err);
                alert("시험 상태를 확인하는 중 오류가 발생했습니다.");
              }
            }}

          >
            {isExpired
              ? "시험 종료됨"
              : timeLeft > 0
              ? `시험 대기 중 (${formatTime(timeLeft)})`
              : "시험 응시"}
          </button>


        </div>
      </div>
    </MainLayout>
  );
};

export default ExamReady;
