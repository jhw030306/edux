import React, { useState } from "react";

export const LectureEnter = ({ onSubmit, onClose }) => {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    onSubmit(code);
    setCode("");
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <h2>인증코드 입력</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="인증코드"
        />
        <div className="delete-buttons">
          <button
            onClick={handleSubmit}
            className="submit-btn"
          >
            등록
          </button>
          <button onClick={onClose} className="submit-btn">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
