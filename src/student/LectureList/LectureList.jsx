import React, { useState, useEffect, useCallback } from "react";
import { LectureCard } from "./LectureCard";
import { LectureEnter } from "./LectureEnter";
import { useNavigate } from "react-router-dom";
import "./LectureList.css";

const API_BASE = import.meta.env.VITE_API_URL;

export const StuLecturepage = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    // 현재 "/"가 아니면 메인으로, 메인이면 새로고침
     if (window.location.pathname === "/stulecturelist") {
       window.location.reload();
    } else {
       navigate("/main");
     }
  };

  const goToLecture = (lecture) => {
  //console.log("넘기는 lecture 객체:", lecture); // 🔍 로그 찍어보기
  sessionStorage.setItem("selectedLecture", JSON.stringify(lecture)); //강의실 정보 세션 저장
  navigate("/stulecture", {
    state: { lecture },
  });
};
  const [lectures, setLectures] = useState([]);
  const [isEnterOpen, setIsEnterOpen] = useState(false);

  const studentLoginId = sessionStorage.getItem("studentLoginId");
  const studentPk      = sessionStorage.getItem("studentId");

  const [studentInfo, setStudentInfo] = useState({
    studentNumber: "",
    name: "",
    phoneNumber: "",
  });

  // 전체 강의 목록 로드 함수
  const loadLectures = useCallback(() => {
    fetch(`${API_BASE}/student-classrooms/${studentLoginId}`)
      .then((res) => {
        if (!res.ok) throw new Error("강의 목록 불러오기 실패");
        return res.json();
      })
      .then((data) => setLectures(data))
      .catch((err) => console.error("강의 목록 에러:", err));
  }, [studentLoginId]);

  useEffect(() => {
    if (!studentLoginId || !studentPk) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    loadLectures();

    fetch(`${API_BASE}/students/${studentPk}`)
      .then((res) => {
        if (!res.ok) throw new Error("학생 정보 불러오기 실패");
        return res.json();
      })
      .then((data) =>
        setStudentInfo({
          studentNumber: data.studentNumber,
          name:          data.name,
          phoneNumber:   data.phoneNumber,
        })
      )
      .catch((err) => console.error("학생 정보 에러:", err));
  }, [studentLoginId, studentPk, navigate, loadLectures]);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/students/logout`, {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.removeItem("studentLoginId");
    sessionStorage.removeItem("studentId");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  return (
    <div className="page-container">
      <aside className="sidebar">

        <h1 className="logo" onClick={goToHome}>
          EduX
        </h1>
        <div className="avatar" />
        <p className="logout" onClick={handleLogout}>


          [ 로그아웃 ]
        </p>
        <div className="name">
          {studentInfo.studentNumber}{" "}
          <span className="thin">{studentInfo.name}</span>
        </div>
        <div className="email">{studentInfo.phoneNumber}</div>
      </aside>

      <main className="main">
        <div className="card-grid">
          {lectures.map((lec) => (
            <LectureCard
              key={lec.id}
              title={lec.className}
              authCode={lec.accessCode} 
              section={lec.section}
              schedule={lec.time}
              onClick={() => goToLecture(lec)}
            />
          ))}

          <div
            className="card add-card"
            onClick={() => setIsEnterOpen(true)}
          >
            + 인증코드 입력
          </div>
        </div>
      </main>

      {isEnterOpen && (
        <LectureEnter
          onClose={() => setIsEnterOpen(false)}
          onSubmit={async (newLecture) => {
            // 1) 새로고침 없이 전체 목록 다시 로드
            await loadLectures();
            setIsEnterOpen(false);
          }}
        />
      )}
    </div>
  );
};
