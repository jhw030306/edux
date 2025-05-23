import React from "react";
import QuestionCard from "./Question/QuestionCard";
import QuestionSidebar from "./Question/QuestionSidebar";
import "./ExamEditor.css";

const ExamQuestions = ({
  questions,
  setQuestions,
  settings,
}) => {
<<<<<<< HEAD
  // 문제 추가 함수
=======
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: "",
<<<<<<< HEAD
      options: type === "multiple" ? ["", ""] : [],
      answer:
        type === "multiple"
          ? []
          : type === "ox"
          ? null
          : "",
=======
      options: ["", "", "", ""],
      answer: type === "multiple" ? [] : "",
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      multipleChoice: false,
      score: settings.useSameScore
        ? settings.scorePerQuestion
        : 0,
    };
    setQuestions([...questions, newQuestion]);
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
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
<<<<<<< HEAD
            onUpdate={(updated) =>
              updateQuestion(i, updated)
            }
=======
            onUpdate={(upd) => updateQuestion(i, upd)}
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
            onRemove={() => removeQuestion(i)}
            onMove={moveQuestion}
            useSameScore={settings.useSameScore}
          />
        ))}
      </div>
<<<<<<< HEAD

=======
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      <QuestionSidebar onAdd={addQuestion} />
    </div>
  );
};

export default ExamQuestions;
