import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Grading.css"; // 스타일 따로 관리
import axios from "axios";

const Grading = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ exam을 location.state 또는 sessionStorage에서 복구
  const examFromState = location.state?.exam;
  const examFromStorage = sessionStorage.getItem("selectedExam");
  const exam = examFromState || (examFromStorage && JSON.parse(examFromStorage));

  const examId = exam?.id;
  const classroomId = exam?.classroomId;

  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!examId || !classroomId) {
      console.error("❌ classroomId 또는 examId가 없습니다.");
      return;
    }

    const fetchStudents = async () => {
      try {
        const { data: studentList } = await axios.get(
          `/api/professor/student-classrooms/classroom/${classroomId}/students`
        );

        const updatedList = await Promise.all(
          studentList.map(async (student) => {
            try {
              const { data: answers } = await axios.get(
                `/api/exam-result/answers`,
                {
                  params: {
                    examId,
                    userId: student.studentId,
                  },
                }
              );

              const status = answers.length === 0 ? "미응시" : "미채점";
              const score = answers.some((a) => a.score != null)
                ? answers.reduce((sum, a) => sum + (a.score || 0), 0)
                : null;
              return {
                ...student,
                score,
                status: score !== null ? "채점 완료" : status,
              };
            } catch (err) {
              if (err.response?.status === 404) {
                return {
                  ...student,
                  score: null,
                  status: "미응시",
                };
              }
              console.error("❌ 답안 조회 실패", err);
              return {
                ...student,
                score: null,
                status: "오류",
              };
            }
          })
        );

        setStudents(updatedList);
      } catch (err) {
        console.error("❌ 학생 목록 조회 실패", err);
      }
    };

    fetchStudents();
  }, [classroomId, examId]);

  const handleAutoGrading = () => {
    alert("자동채점 기능은 아직 연결되어 있지 않습니다.");
  };

  const goToStudentGrading = (student) => {
    navigate("/gradingstudent", {
      state: { student, examId },
    });
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
              <tr key={s.studentId}>
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
