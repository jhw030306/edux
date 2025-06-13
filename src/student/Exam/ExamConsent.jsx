// src/student/Exam/ExamConsent.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamTakingLayout.css"; // ✅ ExamOn/Off와 같은 스타일 사용

const ExamConsent = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const examId = new URLSearchParams(search).get("examId");

  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (!agreed) return;
    navigate(`/examready?examId=${examId}`);
  };

  return (
    <MainLayout>
      <div className="exam-wrapper">
        <div className="consent-container">
          <div className="consent-box">
            <h2>시험 응시 전 안내사항</h2>
            <ul className="consent-notice">
              <li>
                🔒 단축키(Ctrl, Alt 등) 사용은 제한됩니다.
              </li>
              <li>
                🖱 창을 벗어나거나 마우스를 이동하면
                부정행위로 감지됩니다.
              </li>
              <li>
                💾 답안은 자동 저장되며, 모든 부정행위는
                기록됩니다.
              </li>
            </ul>

            <label className="consent-check">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) =>
                  setAgreed(e.target.checked)
                }
              />
              위 내용을 모두 읽고 이해했으며 동의합니다.
            </label>

            <button
              className="submit-btn"
              disabled={!agreed}
              onClick={handleConfirm}
            >
              확인하고 시험 응시
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamConsent;
