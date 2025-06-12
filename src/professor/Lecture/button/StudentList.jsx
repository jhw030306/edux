import React, { useState, useMemo, useEffect } from "react";
import { MainLayout } from "../../../layout/MainLayout";
import "../Lecture.css";

export const StudentList = () => {
  const [students, setStudents] = useState([]); // 초기값은 빈 배열
  const [searchTerm, setSearchTerm] = useState("");

    // ✅ 백엔드에서 학생 목록 받아오기
useEffect(() => {
  const fetchStudents = async () => {
    try {
      const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
      if (!classroomId) {
        console.warn("선택된 강의가 없습니다.");
        return;
      }

      const response = await fetch(`/api/professor/student-classrooms/classroom/${classroomId}/students`);
      if (!response.ok) {
        throw new Error("학생 데이터를 불러오는 데 실패했습니다.");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("에러 발생:", error);
    }
  };

  fetchStudents();
}, []);

//삭제
  const handleDelete = async (studentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
    if (!classroomId) {
      alert("강의실 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `/api/professor/student-classrooms/classroom/${classroomId}/student/${studentId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      // 클라이언트에서도 삭제된 학생 제거
      setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제에 실패했습니다.");
    }
  };


  // ✅ 학번순 정렬 + 검색 필터링
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) =>
      [
        s.studentNumber,
        s.name,
        s.email,
      ].some((field) =>
        String(field).toLowerCase().includes(searchTerm.toLowerCase())
      )

      )
      .sort((a, b) => a.studentNumber - b.studentNumber);
  }, [students, searchTerm]);

  return (
    <MainLayout>
      <div className="page-content">
        {/* ✅ 검색창 */}
        <input
          type="text"
          placeholder="학번, 이름, 이메일 검색"
          className="student-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* ✅ 테이블 */}
        <table className="student-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>학번</th>
              <th>이름</th>
              <th>이메일</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td> 
                <td><strong>{s.studentNumber}</strong></td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => handleDelete(s.studentId)} // ✅ studentId 사용
                  >
                    삭제
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
