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

        navigate(
          isDenied
            ? `/examoff?examId=${examInfo.id}`
            : `/examon?examId=${examInfo.id}`
        );
      }

    };
    updateCountdown();
    timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [examInfo]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min} : ${sec}`;
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
            <ul>
              <li>
                시험 중 페이지 이탈 시 자동 제출됩니다.
              </li>
              <li>부정행위는 실격 처리됩니다.</li>
              <li>시험 시간은 60분이며 자동 종료됩니다.</li>
              <li>
                다른 기기에서의 동시 접속은 불가합니다.
              </li>
            </ul>
          </div>

          <button
            className="start-button"
            onClick={() => {
              const mode = examInfo.mode;           // or examInfo.access.mode
              const isDenied = mode === "deny";

              navigate(
                isDenied
                  ? `/examoff?examId=${examInfo.id}`
                  : `/examon?examId=${examInfo.id}`
              );
            }}
          >
            시험 응시
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamReady;
