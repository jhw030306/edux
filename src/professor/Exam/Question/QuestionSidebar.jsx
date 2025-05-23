import React from "react";

const QuestionSidebar = ({ onAdd }) => {
  return (
    <div className="question-sidebar">
<<<<<<< HEAD
      <h3>문제 유형 추가</h3>
=======
      <h4>문제 유형 추가</h4>
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
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
