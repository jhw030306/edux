import React, { useState, useMemo } from "react";
import { MainLayout } from "../../../layout/MainLayout";
import "../Lecture.css";

export const StudentList = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      department: "컴퓨터공학과",
      studentNumber: "2226071",
      name: "지혜원",
      email: "jhw@gmail.com",
    },
    {
      id: 2,
      department: "컴퓨터공학과",
      studentNumber: "1222487",
      name: "홍길동",
      email: "abc12345@gmail.com",
    },
    {
      id: 3,
      department: "전자공학과",
      studentNumber: "20231234",
      name: "김학생",
      email: "student@gmail.com",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // ✅ 학번순 정렬 + 검색 필터링
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) =>
        [
          s.department,
          s.studentNumber,
          s.name,
          s.email,
        ].some((field) =>
          field
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) =>
        a.studentNumber.localeCompare(b.studentNumber)
      );
  }, [students, searchTerm]);

  return (
    <MainLayout>
      <div className="page-content">
        {/* ✅ 검색창 */}
        <input
          type="text"
          placeholder="학과, 학번, 이름, 이메일 검색"
          className="student-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* ✅ 테이블 */}
        <table className="student-table">
          <thead>
            <tr>
              <th>학과</th>
              <th>학번</th>
              <th>이름</th>
              <th>이메일</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id}>
                <td>{s.department}</td>
                <td>
                  <strong>{s.studentNumber}</strong>
                </td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => handleDelete(s.id)}
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
