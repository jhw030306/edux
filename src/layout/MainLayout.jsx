import React from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
import { useNavigate, useLocation } from "react-router-dom";
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
import "./MainLayout.css";

export const MainLayout = ({ children }) => {
  const navigate = useNavigate();
<<<<<<< HEAD

  // sessionStorage에서 강의 정보 불러오기
  const savedLecture = sessionStorage.getItem(
    "selectedLecture"
  );
  const lecture = savedLecture
    ? JSON.parse(savedLecture)
    : null;

  const title = lecture?.className || "강의명 없음";
=======
  const location = useLocation();
  const lecture = location.state?.lecture;

  const title = lecture?.title || "강의명 없음";
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
  const section = lecture?.section || "1분반";

  return (
    <div className="Main-layout">
      <div
        className="Main-logo"
        onClick={() => navigate("/main")}
      >
        EduX
        <span className="lecture-name">
          {title} {section}
        </span>
      </div>
      <div
        className="Main-logout"
<<<<<<< HEAD
        onClick={() => {
          sessionStorage.clear(); // 로그아웃 시 전체 제거
          navigate("/login");
        }}
=======
        onClick={() => navigate("/login")}
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      >
        로그아웃
      </div>
      <div className="Main-box">{children}</div>
    </div>
  );
};
