import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Loginpage.css";

export const Loginpage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState("professor");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  useEffect(() => {
    if (location.state?.userType === "student") {
      setUserType("student");
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const url =
      userType === "professor"
        ? "/api/professors/login"
        : "/api/students/login";
    const payload =
      userType === "professor"
        ? { username: loginForm.username, password: loginForm.password }
        : { studentId: loginForm.username, password: loginForm.password };

    try {
      const response = await axios.post(url, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      alert("로그인 성공!");

      if (userType === "professor") {
        sessionStorage.setItem("professorId", response.data.id);
        navigate("/prolecture");
      } else {
        // ✅ 학생일 때: 고유 PK와 로그인 아이디 둘 다 저장
        sessionStorage.setItem("studentId", response.data.id);
        sessionStorage.setItem("studentLoginId", response.data.studentId);
        navigate("/stulecture");
      }
    } catch (error) {
      console.error("로그인 실패", error);
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const goTo = (path) => navigate(path);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-title" onClick={() => goTo("/main")}>
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
          <input
            className="input-id"
            placeholder="아이디"
            name="username"
            value={loginForm.username}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <input
            className="input-password"
            type="password"
            placeholder="비밀번호"
            name="password"
            value={loginForm.password}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="login-button" onClick={handleLogin}>
            로그인
          </button>

          <div className="login-actions">
            <span onClick={() => goTo("/idfind")}>아이디 찾기</span>
            <span className="separator">|</span>
            <span onClick={() => goTo("/pwfind")}>비밀번호 찾기</span>
            <span className="separator">|</span>
            <span onClick={() => goTo("/signup")}>회원가입</span>
          </div>
        </div>
      </div>
    </div>
  );
};
