import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react"; 
import axios from "axios";
import "./Loginpage.css";


export const Loginpage = () => {
  const location = useLocation();
  const [userType, setUserType] = useState("professor");

  useEffect(() => {
    if (location.state?.userType === "student") {
      setUserType("student");
    }
  }, [location.state]);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const goToMain = () => {
    navigate("/main");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const goToIdfind = () => {
    navigate("/idfind");
  };

  const goToPwfind = () => {
    navigate("/pwfind");
  };

  // const handleLogin = () => {
  //   if (userType === "professor") {
  //     navigate("/prolecture");
  //   } else if (userType === "student") {
  //     navigate("/stulecture");
  //   }
  // };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
  
    if (userType === "professor") {
      try {
        const response = await axios.post("/api/professors/login", {
          username: loginForm.username,
          password: loginForm.password
        }, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        });
  
        alert("로그인 성공!");
        localStorage.setItem("professorId", response.data.id);
        navigate("/prolecture");
      } catch (error) {
        alert("로그인 실패: " + (error.response?.data || error.message));
      }
    } else if (userType === "student") {
      alert("학생 로그인은 아직 준비 중입니다!");
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
              name="username"
              value={loginForm.username}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-password"
              placeholder="비밀번호"
              name="password"
              value={loginForm.password}
              onChange={handleInputChange}
            />
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
          >
            로그인
          </button>

          <div className="login-actions">
            <span onClick={goToIdfind}>아이디 찾기</span>
            <span className="separator">|</span>
            <span onClick={goToPwfind}>비밀번호 찾기</span>
            <span className="separator">|</span>
            <span onClick={goToSignup}>회원가입</span>
          </div>
        </div>
      </div>
    </div>
  );
};
