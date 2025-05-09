import React, { useState } from "react";
import { LectureCard } from "./LectureCard";
import { LectureEnter } from "./LectureEnter";
import "./LectureList.css";

export const StuLecturepage = () => {
  const [lectures, setLectures] = useState([]);
  const [isEnterOpen, setIsEnterOpen] = useState(false);

  const codeDatabase = {
    515279: {
      title: "캡스톤디자인",
      authCode: "515279",
      section: "1분반",
      schedule: "월요일 14:00 ~ 16:00",
    },
    999888: {
      title: "웹프로그래밍",
      authCode: "999888",
      section: "2분반",
      schedule: "화요일 10:00 ~ 12:00",
    },
  };

  const handleAddLectureByCode = (code) => {
    const lecture = codeDatabase[code];
    if (lecture) {
      const isAlreadyAdded = lectures.some(
        (l) => l.authCode === lecture.authCode
      );
      if (!isAlreadyAdded) {
        setLectures([...lectures, lecture]);
        setIsEnterOpen(false);
      } else {
        alert("이미 추가된 강의입니다.");
      }
    } else {
      alert("유효하지 않은 인증코드입니다.");
    }
  };

  return (
    <div className="page-container">
      <aside className="sidebar">
        <h1 className="logo">EduX</h1>
        <div className="avatar" />
        <p className="logout">[ 로그아웃 ]</p>
        <div className="name">
          12345678 <span className="thin">김학생</span>
        </div>
        <div className="email">abc1234@gmail.com</div>
      </aside>

      <main className="main">
        <div className="card-grid">
          {lectures.map((lecture, idx) => (
            <LectureCard key={idx} {...lecture} />
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
          onSubmit={handleAddLectureByCode}
        />
      )}
    </div>
  );
};
