import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Pwfindpage.css";
import axios from "axios";

export const Pwfindpage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const goToMain = () => {
    navigate("/main");
  };

  const { id = "", email = "" } = location.state || {};

  const [inputId, setInputId] = useState(id); // 아이디 수정 가능하도록 관리
  const [inputEmail, setInputEmail] = useState(email);
  const [sentCode, setSentCode] = useState("");
  const [inputCode, setInputCode] = useState("");

  const handleSendCode = () => {
    if (!inputEmail.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // 6자리 랜덤 코드
    setSentCode(code);
    alert(`인증번호 발송 완료 (모의): ${code}`);
  };

  const handleNext = async() => {
    if (
      !inputId.trim() ||
      !inputEmail.trim() ||
      !inputCode.trim()
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (inputCode !== sentCode) {
      alert("인증번호가 일치하지 않습니다.");
      return;
    }

    try {
    const response = await axios.get("/api/professors/verify-password-reset", {
      params: {
        username: inputId,
        email: inputEmail
      },
      withCredentials: true
    });

    navigate("/pwresult", {
      state: {
        username: inputId,
        email: inputEmail
      }
    });
  } catch (error) {
    alert("일치하는 사용자 정보를 찾을 수 없습니다.");
  }
};

  return (
    <div className="pwfind-page">
      <div className="pwfind-container">
        <div className="pwfind-title" onClick={goToMain}>
          EduX
        </div>
        <div className="pwfind-subtitle">비밀번호 찾기</div>

        <div className="pwfind-form">
          <div className="input-group">
            <input
              type="text"
              className="input-box"
              placeholder="아이디"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              className="input-box"
              placeholder="이메일 입력"
              value={inputEmail}
              onChange={(e) =>
                setInputEmail(e.target.value)
              }
            />
            <button
              className="send-code-button"
              onClick={handleSendCode}
            >
              인증번호 받기
            </button>
          </div>

          <div className="input-group">
            <input
              type="text"
              className="input-box"
              placeholder="인증번호 입력"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
          </div>

          <button
            className="pwfind-next-button"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};
