// src/student/Exam/ExamReady.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamReady.css";

const ExamReady = () => {
  const navigate = useNavigate();

  // ✅ 하드코딩된 시험 정보 (API 없이 테스트용)
  const examInfo = {
    id: 1,
    title: "캡스톤디자인 중간고사",
    className: "캡스톤디자인 1분반",
    testStartTime: "2025-05-27T23:59:59", // 미래 시간
    allowInternet: true,
    duration: 60,
    notice: "부정행위 금지, 시험 시간은 60분입니다.",
  };

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const start = new Date(
      examInfo.testStartTime
    ).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(
        0,
        Math.floor((start - now) / 1000)
      );
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(timer);
        // ✅ 인터넷 허용 여부에 따라 분기
        if (examInfo.allowInternet) {
          navigate(
            `/student/exam-on?examId=${examInfo.id}`
          );
        } else {
          navigate(
            `/student/exam-off?examId=${examInfo.id}`
          );
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [
    examInfo.testStartTime,
    examInfo.id,
    examInfo.allowInternet,
    navigate,
  ]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(
      2,
      "0"
    );
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min} : ${sec}`;
  };

  return (
    <MainLayout>
      <div className="exam-ready">
        <div className="exam-ready-box">
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
            onClick={() =>
              navigate(
                examInfo.allowInternet
                  ? `/examon?examId=${examInfo.id}`
                  : `/examoff?examId=${examInfo.id}`
              )
            }
          >
            시험 응시
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamReady;
