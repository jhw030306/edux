// src/layouts/AuthLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import "./AuthLayout.css";

export const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  const goToMain = () => {
    navigate("/main");
  };
  return (
    <div className="auth-layout">
      <div className="auth-logo" onClick={goToMain}>
        EduX
      </div>
      <div className="auth-box">{children}</div>
    </div>
  );
};
