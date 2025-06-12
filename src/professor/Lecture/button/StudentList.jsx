import React, { useState, useMemo, useEffect } from "react";
import { MainLayout } from "../../../layout/MainLayout";
import "./button.css";
import * as XLSX from "xlsx/xlsx.mjs";

export const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDownload = () => {
    const lecture = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    );

    const fileName = `${lecture?.className ?? "강의명"}_${
      lecture?.section ?? "분반"
    }_학생목록`;

    const datas = filteredStudents.length
      ? filteredStudents
      : [];
    const worksheet = XLSX.utils.json_to_sheet(datas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sheet1"
    );
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const classroomId = JSON.parse(
          sessionStorage.getItem("selectedLecture")
        )?.id;
        if (!classroomId) {
          console.warn("선택된 강의가 없습니다.");
          return;
        }

        const response = await fetch(
          `/api/professor/student-classrooms/classroom/${classroomId}/students`
        );
        if (!response.ok)
          throw new Error(
            "학생 데이터를 불러오는 데 실패했습니다."
          );

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("에러 발생:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleDelete = async (studentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;
    if (!classroomId) {
      alert("강의실 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `/api/professor/student-classrooms/classroom/${classroomId}/student/${studentId}`,
        { method: "DELETE" }
      );

      if (!response.ok)
        throw new Error("삭제에 실패했습니다.");

      setStudents((prev) =>
        prev.filter((s) => s.studentId !== studentId)
      );
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) =>
        [s.studentNumber, s.name, s.email].some((field) =>
          String(field)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => a.studentNumber - b.studentNumber);
  }, [students, searchTerm]);

  return (
    <MainLayout>
      <div className="page-content">
        <div className="top-bar">
          <input
            type="text"
            placeholder="학번, 이름, 이메일 검색"
            className="student-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="action-button"
            onClick={handleDownload}
          >
            파일 다운로드
          </button>
        </div>

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
                <td>
                  <strong>{s.studentNumber}</strong>
                </td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() =>
                      handleDelete(s.studentId)
                    }
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
