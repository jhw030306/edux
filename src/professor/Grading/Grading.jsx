import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Grading.css"; // 스타일 따로 관리

const Grading = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // 예시용 더미 데이터
    setStudents([
      {
        id: 1,
        name: "지혜원",
        studentNumber: "2226071",
        score: null,
        status: "미채점",
      },
      {
        id: 2,
        name: "홍길동",
        studentNumber: "1222487",
        score: 85,
        status: "채점 완료",
      },
    ]);
  }, []);

  const handleAutoGrading = () => {
    // 실제 API 연동 필요
    alert("자동채점 완료");
  };

  const goToStudentGrading = (student) => {
    navigate("/gradingstudent", { state: { student } });
  };

  return (
    <MainLayout>
      <div className="grading-list-wrapper">
        <div className="grading-list-header">
          <button
            className="auto-grade-btn"
            onClick={handleAutoGrading}
          >
            자동채점
          </button>
        </div>

        <table className="grading-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>학번</th>
              <th>점수</th>
              <th>상태</th>
              <th>시험지</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.studentNumber}</td>
                <td>{s.score !== null ? s.score : "-"}</td>
                <td>{s.status}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => goToStudentGrading(s)}
                  >
                    시험지 보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default Grading;
