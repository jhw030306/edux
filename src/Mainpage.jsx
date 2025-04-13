// src/Mainpage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/Button.jsx";
import "./Mainpage.css";

export const Mainpage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="mainpage">
      <div className="main-title">EduX</div>

      <div className="auth-button-group">
        <Button
          property1="default"
          text="로그인"
          size="sm"
          onClick={goToLogin}
        />
        <Button
          property1="default"
          text="회원가입"
          size="sm"
          onClick={goToSignup}
        />
      </div>
    </div>
  );
};
