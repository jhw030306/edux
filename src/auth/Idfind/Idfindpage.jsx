import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Idfindpage.css";

export const Idfindpage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] =
    useState("");
  const [sentCode, setSentCode] = useState("");

  const goToMain = () => {
    navigate("/main");
  };

  const handleSendCode = () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    setSentCode(code);
    alert(`인증번호 발송 완료 (모의): ${code}`);
  };

  const handleNext = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !verificationCode.trim()
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (verificationCode !== sentCode) {
      alert("인증번호가 일치하지 않습니다.");
      return;
    }
    navigate("/idresult", {
      state: { name, email },
    });
  };

  return (
    <div className="idfind-page">
      <div className="idfind-container">
        <div className="idfind-title" onClick={goToMain}>
          EduX
        </div>
        <div className="idfind-subtitle">아이디 찾기</div>

        <div className="idfind-form">
          <div className="input-group">
            <input
              type="text"
              className="input-box"
              placeholder="이름 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              className="input-box"
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value)
              }
            />
          </div>

          <button
            className="idfind-next-button"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};
