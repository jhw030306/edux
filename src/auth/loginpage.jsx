import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loginpage.css";

export const Loginpage = () => {
  const [userType, setUserType] = useState("professor");

  const navigate = useNavigate();

  const goToMain = () => {
    navigate("/main");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    if (userType === "professor") {
      navigate("/professor-dashboard");
    } else if (userType === "student") {
      navigate("/student-dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-title" onClick={goToMain}>
          EduX
        </div>

        <div className="login-radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="userType"
              value="professor"
              checked={userType === "professor"}
              onChange={() => setUserType("professor")}
            />
            출제자 로그인
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="userType"
              value="student"
              checked={userType === "student"}
              onChange={() => setUserType("student")}
            />
            학생 로그인
          </label>
        </div>

        <div className="login-form">
          <div className="input-group">
            <input
              type="text"
              className="input-id"
              placeholder="아이디"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-password"
              placeholder="비밀번호"
            />
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
          >
            로그인
          </button>

          <div className="login-actions">
            <span>아이디 찾기</span>
            <span className="separator">|</span>
            <span>비밀번호 찾기</span>
            <span className="separator">|</span>
            <span onClick={goToSignup}>회원가입</span>
          </div>
        </div>
      </div>
    </div>
  );
};
