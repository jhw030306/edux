import React from "react";
import QuestionCard from "./Question/QuestionCard";
import QuestionSidebar from "./Question/QuestionSidebar";
import "./ExamEditor.css";

const ExamQuestions = ({
  questions,
  setQuestions,
  settings,
}) => {
  // 문제 추가 함수
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: "",
      options: type === "multiple" ? ["", ""] : [],
      answer:
        type === "multiple"
          ? []
          : type === "ox"
          ? null
          : "",
      multipleChoice: false,
      score: settings.useSameScore
        ? settings.scorePerQuestion
        : 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  // 문제 업데이트
  const updateQuestion = (idx, updated) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx] = updated;
    setQuestions(updatedQuestions);
  };

  // 문제 삭제
  const removeQuestion = (idx) => {
    const filtered = questions.filter((_, i) => i !== idx);
    setQuestions(filtered);
  };

  // 문제 순서 이동
  const moveQuestion = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= questions.length)
      return;
    const newList = [...questions];
    [newList[idx], newList[targetIdx]] = [
      newList[targetIdx],
      newList[idx],
    ];
    setQuestions(newList);
  };

  return (
    <div className="exam-questions">
      <div className="question-list">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            data={q}
            onUpdate={(updated) =>
              updateQuestion(i, updated)
            }
            onRemove={() => removeQuestion(i)}
            onMove={moveQuestion}
            useSameScore={settings.useSameScore}
          />
        ))}
      </div>

      <QuestionSidebar onAdd={addQuestion} />
    </div>
  );
};

export default ExamQuestions;

