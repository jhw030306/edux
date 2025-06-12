import React from "react";
import QuestionCard from "./Question/QuestionCard";
import QuestionSidebar from "./Question/QuestionSidebar";
import "./ExamEditor.css";
import api from "../../api/axios"

const ExamQuestions = ({
  examId,
  questions = [],
  setQuestions,
  settings,
}) => {
  // 1) questions가 배열이 아닐 경우 대비
  const questionList = Array.isArray(questions) ? questions : [];

  // 2) 문제 추가
  const addQuestion = async (type) => {
    console.log("추가 타입:", type);
    const placeholderId = Date.now().toString();
    const num = questionList.length + 1;
    const newQuestion = {
      id: placeholderId,
      number: num,
      type,
      question: "",
      options: type === "multiple" ? ["", ""] : [],
      answer: type === "multiple" ? [] : type === "ox" ? null : "",
      score: settings.useSameScore
        ? settings.scorePerQuestion
        : 0,
    };

    // 함수형 업데이트만 사용
    setQuestions((prev) => [...prev, newQuestion]);

    try {
      const payload = {
        examId,
        number: num,
        type: newQuestion.type,
        question: newQuestion.question,
        questionScore: newQuestion.score,
        distractor: newQuestion.options,
        answer: newQuestion.answer,
      };
      const res = await api.post(
        "/exam-questions/autosave",
        payload
      );
      const realId = res.data.id;

      // placeholderId → realId 반영
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === placeholderId ? { ...q, id: realId } : q
        )
      );
    } catch (err) {
      console.error(
        "문제 생성 실패:",
        err.response?.data || err.message
      );
    }
  };

  // 3) 문제 수정
  const updateQuestion = async (idx, updated) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...updated, number: idx + 1 };
      return copy;
    });

    try {
      const payload = {
        id: updated.id,
        examId,
        number: idx + 1,
        type: updated.type,
        question: updated.question,
        questionScore: updated.score,
        distractor: updated.options,
        answer: updated.answer,
      };
      const res = await api.post(
        "/exam-questions/autosave",
        payload
      );
      const newId = res.data.id;
      if (newId && newId !== updated.id) {
        setQuestions((prev) =>
          prev.map((q, i) =>
            i === idx ? { ...q, id: newId } : q
          )
        );
      }
    } catch (err) {
      console.error(
        "문제 수정 실패:",
        err.response?.data || err.message
      );
    }
  };

  // 4) 문제 삭제 + 번호 재정렬
  const removeQuestion = async (idx) => {
    const toRemove = questionList[idx];

    // 4-1) UI에서 제거
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((q, i) => ({ ...q, number: i + 1 }))
    );

    // 4-2) 서버에서 삭제
    try {
      await api.delete(`/exam-questions/${toRemove.id}`);
    } catch (err) {
      console.error(
        "DELETE API 요청 실패:",
        err.response?.data || err.message
      );
    }

    // 4-3) bulk로 번호 동기화
    try {
      const bulkPayload = questionList
        .filter((_, i) => i !== idx)
        .map((q, i) => ({
          id: q.id,
          examId,
          number: i + 1,
          type: q.type,
          question: q.question,
          questionScore: q.score,
          distractor: q.options,
          answer: q.answer,
        }));
      await api.post(
        "/exam-questions/autosave/bulk",
        bulkPayload
      );
    } catch (err) {
      console.error(
        "문제 재정렬 동기화 실패:",
        err.response?.data || err.message
      );
    }
  };

  // 5) 문제 순서 이동
  const moveQuestion = (idx, dir) => {
    setQuestions((prev) => {
      const newList = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= newList.length) return newList;
      [newList[idx], newList[target]] = [
        newList[target],
        newList[idx],
      ];
      // 번호 다시 붙여 주기
      return newList.map((q, i) => ({
        ...q,
        number: i + 1,
      }));
    });
  };

  return (
    <div className="exam-questions">
      <div className="question-list">
        {questionList.map((q, i) => (
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

