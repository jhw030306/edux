import React from "react";
import ExamViewer from "./ExamViewer";
import "./ExamViewerModal.css";

const ExamViewerModal = ({ onClose }) => {
  return (
    <div className="exam-modal-overlay">
      <div className="exam-modal-content">
        <ExamViewer />
        <button className="close-btn" onClick={onClose}>
          닫기 ✕
        </button>
      </div>
    </div>
  );
};

export default ExamViewerModal;
