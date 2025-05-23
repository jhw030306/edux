import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Lecture.css";

export const StuLecture = () => {
  const location = useLocation();
  const _lecture = location.state?.lecture;

  // 시험 목록을 저장할 상태
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 출제자 API에서 시험 목록을 받아오는 useEffect
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);

      try {
        // 출제자 API에서 시험 목록을 받아옵니다.
        const response = await fetch("/api/exams"); // 실제 API 경로로 수정 필요
        if (!response.ok)
          throw new Error(
            "시험 목록을 불러오는 데 실패했습니다."
          );

        const data = await response.json();
        setExams(data); // 시험 목록 데이터를 상태에 저장
      } catch (err) {
        setError(err.message); // 에러 처리
        console.error("시험 목록 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []); // 페이지가 로드될 때 한 번만 호출

  // 로딩 중, 에러 발생 시 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <MainLayout>
      <div className="page-content">
        {/* 시험 목록 */}
        {exams.length === 0 ? (
          <div>시험이 없습니다.</div>
        ) : (
          exams.map((exam, idx) => (
            <div className="section-box" key={idx}>
              <div className="section-title">
                {exam.name}
              </div>
              <div className="section-actions">
                <button className="action-button">
                  시험 응시
                </button>
                <button className="action-button">
                  시험 결과
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
};
