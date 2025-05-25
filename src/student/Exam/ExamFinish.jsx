// src/student/Exam/ExamFinish.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamFinish.css";

const ExamFinish = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="exam-finish">
        <div className="finish-box">
          <h1>🎉 시험이 제출되었습니다!</h1>
          <p>
            수고하셨습니다. 결과는 추후 공지사항 또는
            강의실을 통해 확인하실 수 있습니다.
          </p>

          <button
            onClick={() => navigate("/student/lecture")}
          >
            강의실로 돌아가기
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamFinish;
