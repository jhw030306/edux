// src/student/Lecture/StuLecture.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Lecture.css";

export const StuLecture = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const _lecture = location.state?.lecture;
  const studentLoginId = sessionStorage.getItem(
    "studentLoginId"
  );

  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      if (!studentLoginId || !_lecture?.id) return;

      try {
        const response = await fetch(
          `/api/exams/examList?studentId=${studentLoginId}&classroomId=${_lecture.id}`
        );
        const data = await response.json();
        setExams(data);
      } catch (error) {
        console.error("시험 목록 불러오기 실패:", error);
      }
    };

    fetchExams();
  }, [_lecture]);

  const handleStartExam = (exam) => {
    sessionStorage.setItem(
      "selectedExam",
      JSON.stringify(exam)
    );
    navigate(`/examready?examId=${exam.id}`);
  };

  return (
    <MainLayout>
      <div className="page-content">
        {exams.map((exam, idx) => (
          <div className="section-box" key={idx}>
            <div className="section-title">
              {exam.title}
            </div>
            <div className="section-actions">
              <button
                className="action-button"
                onClick={() => handleStartExam(exam)}
              >
                시험 응시
              </button>
              <button className="action-button">
                시험 결과
              </button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};
