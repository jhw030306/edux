import React from "react";
import QuestionCard from "./Question/QuestionCard";
import QuestionSidebar from "./Question/QuestionSidebar";
import "./ExamEditor.css";
import axios from "axios"

const ExamQuestions = ({
  examId,
  questions,
  setQuestions,
  settings,
}) => {
  // 문제 추가 함수
  const addQuestion = async(type) => {
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

    // 서버에도 생성 요청 (autoSaveOne)
    try {
      const res = await axios.post("/api/exam-questions/autosave", {
        ...newQuestion,
        examId,
        number: questions.length + 1,
      });
      const realId = res.data.id;
      // 로컬 리스트에 제대로 된 ID 반영
      setQuestions((prev) =>
        prev.map(q => q.id === tempId ? { ...q, id: realId } : q)
      );
    } catch (err) {
      console.error("문제 생성 실패", err);
    }
  };

  // 문제 업데이트
  const updateQuestion = async (idx, updated) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx] = updated;
    setQuestions(updatedQuestions);

     // 서버에 수정(autosaveOne)
    try {
      await axios.post("/api/exam-questions/autosave", {
        ...updated,
        examId,
        number: idx + 1,
      });
    } catch (err) {
      console.error("문제 수정 자동저장 실패", err);
    }

    axios.post("/api/exam-questions/autosave", {
      ...updated,
      examId,
      number: idx + 1,
      questionScore: updated.score,
      distractor: updated.options,
      answer:
        updated.type === "multiple"
          ? (Array.isArray(updated.answer)
              ? updated.answer.map(a => a + 1)
              : updated.answer + 1)
          : updated.answer,
     })
     .then(res => {
       // 서버가 새 id를 내린 경우 UI에 반영
       const newId = res.data.id;
       if (newId && newId !== updated.id) {
         updatedQuestions[idx].id = newId;
         setQuestions(updatedQuestions);
      }
    })
     .catch(err => console.error("문제 자동저장 실패", err));
  };

  // 문제 삭제
  const removeQuestion = async (idx) => {
    const toRemove = questions[idx];
    //  서버 삭제
    if (toRemove.id) {
      try {
        await axios.delete(`/api/exam-questions/${toRemove.id}`);
      } catch (err) {
        console.error("문제 삭제 실패", err);
      }
    }
    const filtered = questions.filter((_, i) => i !== idx);

    //  번호 다시 붙이기 & bulk autosave
    setQuestions(filtered);
    try {
      await axios.post("/api/exam-questions/autosave/bulk",
        filtered.map((q, i) => ({
          ...q,
          examId,
          number: i + 1
        }))
      );
    } catch (err) {
      console.error("문제 재정렬 실패", err);
    }
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

