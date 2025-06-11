import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Grading.css";
import axios from "axios";

const Grading = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 화면 또는 sessionStorage에서 넘어온 exam 정보
  const examFromState = location.state?.exam;
  const examFromStorage = sessionStorage.getItem("selectedExam");
  const exam = examFromState || (examFromStorage && JSON.parse(examFromStorage));

  const examId = exam?.id;
  const classroomId = exam?.classroomId;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1) 학생 목록 + 응시/채점 상태 가져오기
  const fetchStudents = useCallback(async () => {
    if (!examId || !classroomId) {
      console.error("❌ classroomId 또는 examId가 없습니다.");
      return;
    }

    try {
      // 1-0) 강의실 학생 목록
      const { data: list } = await axios.get(
        `/api/professor/student-classrooms/classroom/${classroomId}/students`
      );

      const updated = await Promise.all(
        list.map(async (stu) => {
          // 1-1) 응시 여부 확인
          let answers = [];
          try {
            const resAns = await axios.get("/api/exam-result/answers", {
              params: { examId, userId: stu.studentId },
            });
            answers = resAns.data;
          } catch (e) {
            if (e.response?.status !== 404) throw e;
          }
          if (answers.length === 0) {
            // 응시하지 않음
            return { ...stu, score: null, status: "미응시" };
          }

          // 1-2) grading/status 로 채점 현황 확인
          const { data: gradingList } = await axios.get("/api/grading/status", {
            params: { examId, studentId: stu.studentId },
          });

          if (gradingList.length === 0) {
            // 답안은 있지만 채점 전
            return { ...stu, score: null, status: "미채점" };
          }

          // 채점된 문항만 필터
          const scored = gradingList.filter((g) => g.score != null);
          const allDone = scored.length === gradingList.length;

          if (!allDone) {
            // 일부만 채점된 상태 → 여전히 미채점
            return { ...stu, score: null, status: "미채점" };
          }

          // 1-3) 모든 채점 완료 → 총점 조회
          const { data: totalObj } = await axios.get("/api/grading/total-score", {
            params: {
              name: stu.name,
              studentNumber: stu.studentNumber,
              examId,
            },
          });

          return {
            ...stu,
            score: totalObj.totalScore, // total-score API 결과
            status: "채점 완료",
          };
        })
      );

      setStudents(updated);
    } catch (err) {
      console.error("❌ 학생 목록 조회 실패", err);
    }
  }, [examId, classroomId]);

  // 2) 컴포넌트 마운트 및 examId/classroomId 변경 시
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 3) 자동채점 처리
  const handleAutoGrading = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      // “미채점” 상태인 학생만 자동채점 API 호출
      const toGrade = students.filter((s) => s.status === "미채점");
      await Promise.all(
        toGrade.map((s) =>
          axios.post(
            "/api/grading/autograde",
            null,
            {
              params: {
                name: s.name,
                studentNumber: s.studentNumber,
                examId,
              },
            }
          )
        )
      );
      alert("자동채점 완료");
      // 재조회하여 갱신
      await fetchStudents();
    } catch (err) {
      console.error("자동채점 실패", err);
      alert("자동채점 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const goToStudentGrading = (student) => {
    navigate("/gradingstudent", { state: { student, examId } });
  };

  return (
    <MainLayout>
      <div className="grading-list-wrapper">
        <div className="grading-list-header">
          <button
            className="auto-grade-btn"
            onClick={handleAutoGrading}
            disabled={loading}
          >
            {loading ? "자동채점 중..." : "자동채점"}
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
                {/* score는 “채점 완료”일 때만, 아니면 ‘-’ */}
                <td>{s.status === "채점 완료" ? s.score : "-"}</td>
                <td>{s.status}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => goToStudentGrading(s)}
                    disabled={s.status === "미응시"}
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
