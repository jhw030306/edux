<<<<<<< HEAD
=======
// src/components/ExamDelete.jsx
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
import React from "react";
import "./Lecture.css"; // 필요 시 모달 관련 스타일 포함

export const ExamDelete = ({
  exam,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal">
      <div className="modal-box">
        <h2>시험 삭제</h2>
        <p>
          <strong>{exam.name}</strong> 시험을
          삭제하시겠습니까?
        </p>
        <small className="notice">
          (삭제 시 해당 시험의 정보는 복구되지 않습니다)
        </small>
        <div className="delete-buttons">
          <button
            onClick={onConfirm}
            className="submit-btn"
          >
            삭제
          </button>
          <button onClick={onCancel} className="submit-btn">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
