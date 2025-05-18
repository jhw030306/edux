import React, { useState } from "react";
import axios from "axios";

export const LectureEnter = ({ onSubmit, onClose }) => {
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setErrorMsg("인증코드를 입력해주세요.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const studentLoginId = sessionStorage.getItem("studentLoginId");

    try {
      const { data } = await axios.post(
        "/api/student-classrooms/join-classroom",
        {
          accessCode: code.trim(),
          studentId: studentLoginId,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      // data = { id:…, className:…, … }
      onSubmit(data);
      setCode("");
      onClose();
    } catch (err) {
      console.error("강의 추가 실패:", err);
      setErrorMsg(err.response?.data || "등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <h2>인증코드 입력</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="인증코드"
        />
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        <div className="delete-buttons">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "등록 중..." : "등록"}
          </button>
          <button onClick={onClose} disabled={loading}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
