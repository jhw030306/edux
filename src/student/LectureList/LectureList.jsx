import React, { useState, useEffect } from "react";
import { LectureCard } from "./LectureCard";
import { LectureEnter } from "./LectureEnter";
import { useNavigate } from "react-router-dom";
import "./LectureList.css";

export const StuLecturepage = () => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [isEnterOpen, setIsEnterOpen] = useState(false);

  const rawId = sessionStorage.getItem("studentId");
  const studentId = rawId ? parseInt(rawId) : null;

  const [studentInfo, setStudentInfo] = useState({
    studentNumber: "",
    name: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!studentId || isNaN(studentId)) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    fetch(`/api/student-classrooms/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("강의 목록 불러오기 실패");
        return res.json();
      })
      .then(setLectures)
      .catch((err) => {
        console.error("강의 목록 에러:", err);
      });

    fetch(`/api/students/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("학생 정보 불러오기 실패");
        return res.json();
      })
      .then((data) => {
        setStudentInfo({
          studentNumber: data.studentNumber,
          name: data.name,
          phoneNumber: data.phoneNumber,
        });
      })
      .catch((err) => {
        console.error("학생 정보 에러:", err);
      });
  }, [studentId, navigate]);

  const handleAddLectureByCode = async (code) => {
    try {
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId,
          code: code,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "강의 참여 실패");
      }

      const newLecture = await res.json();
      const isAlreadyAdded = lectures.some((l) => l.id === newLecture.id);
      if (!isAlreadyAdded) {
        setLectures([...lectures, newLecture]);
      } else {
        alert("이미 추가된 강의입니다.");
      }
      setIsEnterOpen(false);
    } catch (error) {
      console.error("강의 추가 실패:", error);
      alert("강의 추가 실패: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/students/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        sessionStorage.removeItem("studentId");
        alert("로그아웃 되었습니다.");
        navigate("/login");
      } else {
        const errorText = await response.text();
        alert("로그아웃 실패: " + errorText);
      }
    } catch (error) {
      console.error("로그아웃 에러:", error);
      alert("서버 오류로 로그아웃에 실패했습니다.");
    }
  };

  return (
    <div className="page-container">
      <aside className="sidebar">
        <h1 className="logo">EduX</h1>
        <div className="avatar" />
        <p className="logout" onClick={handleLogout}>
          [ 로그아웃 ]
        </p>
        <div className="name">
          {studentInfo.studentNumber} <span className="thin">{studentInfo.name}</span>
        </div>
        <div className="email">{studentInfo.phoneNumber}</div>
      </aside>

      <main className="main">
        <div className="card-grid">
          {lectures.map((lecture, idx) => (
            <LectureCard
              key={idx}
              title={lecture.className || lecture.title || "강의명 미정"}
              authCode={lecture.id || lecture.authCode}
              section={lecture.section || "1분반"}
              schedule={lecture.schedule || "시간 미정"}
            />
          ))}
          <div className="card add-card" onClick={() => setIsEnterOpen(true)}>
            + 인증코드 입력
          </div>
        </div>
      </main>

      {isEnterOpen && (
        <LectureEnter
          onClose={() => setIsEnterOpen(false)}
          onSubmit={handleAddLectureByCode}
        />
      )}
    </div>
  );
};
