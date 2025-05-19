import React from "react";
import QuestionCard from "./Question/QuestionCard";
import QuestionSidebar from "./Question/QuestionSidebar";
import "./ExamEditor.css";

const ExamQuestions = ({
  questions,
  setQuestions,
  settings,
}) => {
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: "",
      options: ["", "", "", ""],
      answer: type === "multiple" ? [] : "",
      multipleChoice: false,
      score: settings.useSameScore
        ? settings.scorePerQuestion
        : 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (idx, updated) => {
    const newList = [...questions];
    newList[idx] = updated;
    setQuestions(newList);
  };

  const removeQuestion = (idx) => {
    const newList = [...questions];
    newList.splice(idx, 1);
    setQuestions(newList);
  };

  const moveQuestion = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    const newList = [...questions];
    [newList[idx], newList[target]] = [
      newList[target],
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
            onUpdate={(upd) => updateQuestion(i, upd)}
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
