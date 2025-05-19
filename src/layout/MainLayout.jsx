import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MainLayout.css";

export const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lecture = location.state?.lecture;

  const title = lecture?.title || "강의명 없음";
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
        onClick={() => navigate("/login")}
      >
        로그아웃
      </div>
      <div className="Main-box">{children}</div>
    </div>
  );
};
