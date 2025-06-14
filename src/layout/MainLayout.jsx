import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainLayout.css";

export const MainLayout = ({
  children,
  disableNavigation = false,
  onBlockedNavigation = null,
}) => {
  const navigate = useNavigate();

  const isProfessor =
    !!sessionStorage.getItem("professorId");
  const isStudent = !!sessionStorage.getItem(
    "studentLoginId"
  );

  const goToHome = () => {
    if (disableNavigation) {
      onBlockedNavigation?.("홈 이동 시도");
      return;
    }

    if (isProfessor) {
      navigate("/prolecturelist");
    } else if (isStudent) {
      navigate("/stulecturelist");
    } else {
      navigate("/main");
    }
  };

  const handleLogout = () => {
    if (disableNavigation) {
      onBlockedNavigation?.("로그아웃 시도");
      return;
    }

    sessionStorage.clear();
    navigate("/login");
  };

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
      <div className="Main-logout" onClick={handleLogout}>
        로그아웃
      </div>
      <div className="Main-box">{children}</div>
    </div>
  );
};
