import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Lecture.css";

export const StuLecture = () => {
  const location = useLocation();
  const _lecture = location.state?.lecture;

  // 시험 목록은 출제자 쪽에서 만들어서 여기서 받아온다고 가정 (더미 데이터 혹은 API 호출 가능)
  const [exams, setExams] = useState([]);

  // 예시: 임시로 출제자가 만든 시험 목록을 설정 (실제로는 API에서 받아와야 함)
  useEffect(() => {
    // 출제자가 만든 시험 목록 예시
    setExams([
      { name: "중간고사" },
      { name: "기말고사" },
      { name: "퀴즈1" },
    ]);
  }, []);

  return (
    <MainLayout>
      <div className="page-content">
        {/* 시험 목록 */}
        {exams.map((exam, idx) => (
          <div className="section-box" key={idx}>
            <div className="section-title">{exam.name}</div>
            <div className="section-actions">
              <button className="action-button">
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
