import React from "react";

const QuestionSidebar = ({ onAdd }) => {
  return (
    <div className="question-sidebar">
      <h3>문제 유형 추가</h3>
      <button onClick={() => onAdd("multiple")}>
        객관식
      </button>
      <button onClick={() => onAdd("ox")}>O / X</button>
      <button onClick={() => onAdd("subjective")}>
        서술형
      </button>
    </div>
  );
};

export default QuestionSidebar;
