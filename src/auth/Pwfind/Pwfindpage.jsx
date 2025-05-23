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

  const { id = "", email = "", role = "" } = location.state || {};

  const [inputId, setInputId] = useState(id); 
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

  const handleNext = async () => {
  if (!inputId.trim() || !inputEmail.trim() || !inputCode.trim()) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  if (inputCode !== sentCode) {
    alert("인증번호가 일치하지 않습니다.");
    return;
  }

  try {
    // 1. 학생 API 먼저 시도
    await axios.get("/api/students/verify-password-reset", {
      params: {
        studentId: inputId,
        email: inputEmail,
      },
      withCredentials: true,
    });

    // 성공 시: role을 "학생"으로 설정하고 이동
    navigate("/pwresult", {
      state: {
        id: inputId,
        email: inputEmail,
        role: "학생",
      },
    });
  } catch (studentErr) {
    try {
      // 2. 교수 API 시도
      await axios.get("/api/professors/verify-password-reset", {
        params: {
          username: inputId,
          email: inputEmail,
        },
        withCredentials: true,
      });

      // 성공 시: role을 "교수"로 설정하고 이동
      navigate("/pwresult", {
        state: {
          id: inputId,
          email: inputEmail,
          role: "교수",
        },
      });
    } catch (professorErr) {
      alert("일치하는 사용자 정보를 찾을 수 없습니다.");
    }
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
