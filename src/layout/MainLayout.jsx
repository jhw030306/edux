import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainLayout.css";

export const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  // sessionStorage에 로그인 정보가 있으면 true
  const isProfessor = !!sessionStorage.getItem("professorId");
  const isStudent   = !!sessionStorage.getItem("studentLoginId");

  // 좌상단 로고 클릭 시 분기 이동
  const goToHome = () => {
    if (isProfessor) {
      navigate("/prolecturelist");
    } else if (isStudent) {
      navigate("/stulecturelist");
    } else {
      navigate("/main");
    }
  };

  // sessionStorage에서 강의 정보 불러오기
  const savedLecture = sessionStorage.getItem(
    "selectedLecture"
  );
  const lecture = savedLecture
    ? JSON.parse(savedLecture)
    : null;

  const title = lecture?.className || "강의명 없음";
  const section = lecture?.section || "1분반";

  return (
    <div className="Main-layout">
       <div className="Main-logo" onClick={goToHome}>
        EduX
        <span className="lecture-name">
          {title} {section}
        </span>
      </div>
      <div
        className="Main-logout"
        onClick={() => {
          sessionStorage.clear(); // 로그아웃 시 전체 세션 제거
          navigate("/login");
        }}
      >
        로그아웃
      </div>
      <div className="Main-box">{children}</div>
    </div>
  );
};
