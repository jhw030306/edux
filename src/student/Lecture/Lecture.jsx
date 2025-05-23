import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Lecture.css";

export const StuLecture = () => {
  const location = useLocation();
  const navigate = useNavigate();

    // 강의 정보: location.state에서 가져옴
  const _lecture = location.state?.lecture;

  const studentId = sessionStorage.getItem("studentId"); //기본키
  const studentLoginId = sessionStorage.getItem("studentLoginId"); // 문자열

  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      if (!studentLoginId || !_lecture?.id) {
        console.error("studentId 또는 classroomId 없음");
        return;
      }

      try {
        const response = await fetch(
          `/api/exams/examList?studentId=${studentLoginId}&classroomId=${_lecture.id}`
        );

        if (!response.ok) {
          throw new Error("시험 목록 불러오기 실패");
        }

        const data = await response.json();
        console.log("서버에서 받아온 시험 목록:", data); // 🔍 콘솔에 데이터 찍기
        setExams(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchExams();
  }, [_lecture]);

  // 시험 응시 버튼을 누르면 호출되는 함수
  const handleStartExam = (examId) => {
    navigate("/exam", { state: { examId } }); // examId를 포함해 페이지 이동
  };

  return (
    <MainLayout>
      <div className="page-content">
        {/* 시험 목록 */}
        {exams.map((exam, idx) => (
          <div className="section-box" key={idx}>
            <div className="section-title">{exam.title}</div>
            <div className="section-actions">
              <button className="action-button"
              onClick={() => handleStartExam(exam.id)} // 시험 응시 버튼 클릭 시 ID 전달
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
