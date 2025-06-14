import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./Grading.css";
import api from "../../api/axios";

const STUDENT_STATUS = {
  NOT_SUBMITTED: "미응시",
  NOT_GRADED: "미채점",
  COMPLETED: "채점 완료"
};

const Grading = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const examFromState = location.state?.exam;
  const examFromStorage =
    sessionStorage.getItem("selectedExam");
  const exam =
    examFromState ||
    (examFromStorage && JSON.parse(examFromStorage));

  const examId = exam?.id;
  const classroomId = exam?.classroomId;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading 상태 관리를 위한 state 추가
  const [error, setError] = useState(null);

  // 학생 목록 + 채점 상태 불러오기
  const fetchStudents = useCallback(async () => {
    if (!examId || !classroomId) {
      console.error(
        "❌ classroomId 또는 examId가 없습니다."
      );
      return;
    }

    try {
      const { data: list } = await api.get(
        `/professor/student-classrooms/classroom/${classroomId}/students`
      );

      const updated = await Promise.all(
        list.map(async (stu) => {
          // 응시 여부 확인
          let answers = [];
          try {
            const resAns = await api.get(
              "/exam-result/answers",
              {
                params: { examId, userId: stu.studentId },
              }
            );
            answers = resAns.data;
          } catch (e) {
            if (e.response?.status !== 404) throw e;
          }

          if (answers.length === 0) {
            return {
              ...stu,
              score: null,
              status: STUDENT_STATUS.NOT_SUBMITTED,
            };
          }

          // 문제별 is_grade 가져오기
          const { data: gradeFlags } = await api.get(
            "/exam-result/student",
            {
              params: { examId, userId: stu.studentId },
            }
          );

          const isGrades = gradeFlags.map((r) => r.isGrade);
          const allGraded =
            isGrades.length > 0 &&
            isGrades.every((g) => g === 1);

          if (!allGraded) {
            return {
              ...stu,
              score: null,
              status: STUDENT_STATUS.NOT_GRADED,
            };
          }

          // 총점 조회
          const { data: totalObj } = await api.get(
            "/grading/total-score",
            {
              params: {
                name: stu.name,
                studentNumber: stu.studentNumber,
                examId,
              },
            }
          );

          return {
            ...stu,
            score: totalObj.totalScore,
            status: STUDENT_STATUS.COMPLETED,
          };
        })
      );

      setStudents(updated);
    } catch (err) {
      setError(err.message);
      console.error("❌ 학생 목록 조회 실패", err);
    }
  }, [examId, classroomId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 자동채점
  const handleAutoGrading = async () => {
    try {
      // 학생 명단 존재 여부 확인
      if (!students || students.length === 0) {
        alert('채점할 학생 명단이 없습니다.');
        return;
      }

      // 미채점 상태인 학생만 필터링
      const toGrade = students.filter((s) => s.status === "미채점");
      
      // 미채점 학생이 없는 경우 처리
      if (toGrade.length === 0) {
        alert('자동채점할 학생이 없습니다. (미응시 또는 이미 채점 완료)');
        return;
      }

      // API 호출 전 유효성 검사
      if (!examId) {
        alert('시험 정보가 올바르지 않습니다.');
        return;
      }

      setLoading(true);
      setIsLoading(true);

      await Promise.all(
        toGrade.map((s) =>
          api.post("/grading/autograde", null, {
            params: {
              name: s.name,
              studentNumber: s.studentNumber,
              examId,
            },
          })
        )
      );
      
      alert("자동채점이 완료되었습니다.");
      await fetchStudents();
    } catch (err) {
      console.error("자동채점 중 오류 발생:", err);
      
      // 에러 메시지 상세화
      if (err.response?.status === 404) {
        alert('요청한 리소스를 찾을 수 없습니다.');
      } else {
        alert(`자동채점 처리 중 오류가 발생했습니다: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const goToStudentGrading = (student) => {
    navigate("/gradingstudent", {
      state: { student, examId },
    });
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner">채점 진행 중...</div>
    </div>
  );

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

        {isLoading && <LoadingSpinner />}

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
                <td>
                  {s.status === "채점 완료" ? s.score : "-"}
                </td>
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
