<<<<<<< HEAD
import React, { useState, useRef, useEffect } from "react";
=======
// QuestionCard.jsx
import React from "react";
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
import "./QuestionCard.css";

const QuestionCard = ({
  index,
  data,
  onUpdate,
  onRemove,
  onMove,
<<<<<<< HEAD
}) => {
  const [editingQuestion, setEditingQuestion] =
    useState(false);
  const textareaRef = useRef(null);

=======
  useSameScore,
}) => {
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleOptionChange = (i, value) => {
    const newOptions = [...data.options];
    newOptions[i] = value;
    onUpdate({ ...data, options: newOptions });
  };

  const handleAddOption = () => {
    if (data.options.length >= 10) return;
    onUpdate({ ...data, options: [...data.options, ""] });
  };

  const handleRemoveOption = (i) => {
<<<<<<< HEAD
    const updatedOptions = data.options.filter(
      (_, idx) => idx !== i
    );
    const updatedAnswer = Array.isArray(data.answer)
      ? data.answer
          .filter((a) => a !== i)
          .map((a) => (a > i ? a - 1 : a))
      : data.answer === i
      ? null
      : data.answer > i
      ? data.answer - 1
      : data.answer;
    onUpdate({
      ...data,
      options: updatedOptions,
      answer: updatedAnswer,
=======
    const newOptions = data.options.filter(
      (_, idx) => idx !== i
    );
    const newAnswers = Array.isArray(data.answer)
      ? data.answer.filter((a) => a !== i)
      : data.answer === i
      ? null
      : data.answer;
    onUpdate({
      ...data,
      options: newOptions,
      answer: newAnswers,
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
    });
  };

  const toggleAnswer = (i) => {
<<<<<<< HEAD
    onUpdate({ ...data, answer: i });
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [data.question]);

  return (
    <div className="question-card">
      {/* 문제 입력 줄 */}
      <div className="question-input-row">
        <div className="question-meta">
          <strong>{index + 1}.</strong>
        </div>
        {editingQuestion ? (
          <textarea
            ref={textareaRef}
            className="question-textarea"
            value={data.question}
            onChange={(e) =>
              handleChange("question", e.target.value)
            }
            onBlur={() => setEditingQuestion(false)}
            rows={1}
          />
        ) : (
          <div
            className="question-display"
            onClick={() => setEditingQuestion(true)}
          >
            {data.question || "문제를 입력하세요"}
          </div>
        )}
      </div>

      {/* 객관식 보기 */}
      {data.type === "multiple" && (
        <div className="options">
          {data.options.map((opt, i) => (
            <div key={i} className="option-item">
              <label className="option-radio-wrapper">
                <input
                  type="radio"
                  name={`single-${data.id}`}
                  checked={data.answer === i}
                  onChange={() => toggleAnswer(i)}
                />
              </label>

              <span className="option-label">{i + 1}.</span>

              <input
                type="text"
                value={opt}
                onChange={(e) =>
                  handleOptionChange(i, e.target.value)
                }
                placeholder={`보기 ${i + 1}`}
                className="option-input"
              />

              {data.options.length > 2 && (
                <button
                  onClick={() => handleRemoveOption(i)}
                  className="option-remove"
                  title="삭제"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {data.options.length < 10 && (
            <button
              className="option-add"
              onClick={handleAddOption}
            >
              + 보기 추가
            </button>
          )}
        </div>
      )}

      {/* OX 문제 */}
=======
    if (data.multipleChoice) {
      const updated = data.answer.includes(i)
        ? data.answer.filter((a) => a !== i)
        : [...data.answer, i];
      onUpdate({ ...data, answer: updated });
    } else {
      onUpdate({ ...data, answer: i });
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-meta">
          <strong>{index + 1}.</strong>
        </div>
        <div className="question-controls">
          {!useSameScore ? (
            <input
              type="number"
              value={data.score}
              onChange={(e) =>
                handleChange(
                  "score",
                  parseInt(e.target.value)
                )
              }
              className="score-input"
            />
          ) : (
            <span className="score-label">
              배점: {data.score}점
            </span>
          )}
          <button onClick={() => onMove(index, -1)}>
            ↑
          </button>
          <button onClick={() => onMove(index, 1)}>
            ↓
          </button>
          <button onClick={onRemove}>삭제</button>
        </div>
      </div>

      <textarea
        placeholder="문제를 입력하세요"
        value={data.question}
        onChange={(e) =>
          handleChange("question", e.target.value)
        }
        className="question-textarea"
      />

      {data.type === "multiple" && (
        <>
          <div className="multiple-type-toggle">
            <label>
              <input
                type="checkbox"
                checked={data.multipleChoice || false}
                onChange={(e) => {
                  const isMulti = e.target.checked;
                  handleChange("multipleChoice", isMulti);
                  handleChange(
                    "answer",
                    isMulti ? [] : null
                  );
                }}
              />
              복수 정답 허용
            </label>
          </div>
          <div className="options">
            {data.options.map((opt, i) => (
              <div key={i} className="option-item">
                {data.multipleChoice ? (
                  <input
                    type="checkbox"
                    checked={data.answer.includes(i)}
                    onChange={() => toggleAnswer(i)}
                  />
                ) : (
                  <input
                    type="radio"
                    name={`single-${data.id}`}
                    checked={data.answer === i}
                    onChange={() => toggleAnswer(i)}
                  />
                )}
                <span className="option-label">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(i, e.target.value)
                  }
                  placeholder={`보기 ${i + 1}`}
                />
                {data.options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(i)}
                    className="option-remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {data.options.length < 10 && (
              <button
                onClick={handleAddOption}
                className="option-add"
              >
                + 보기 추가
              </button>
            )}
          </div>
        </>
      )}

>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      {data.type === "ox" && (
        <div className="ox-answer">
          <label>
            <input
              type="radio"
              name={`ox-${data.id}`}
              checked={data.answer === "O"}
              onChange={() => handleChange("answer", "O")}
            />
<<<<<<< HEAD
            O
=======
            O (정답)
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
          </label>
          <label>
            <input
              type="radio"
              name={`ox-${data.id}`}
              checked={data.answer === "X"}
              onChange={() => handleChange("answer", "X")}
            />
<<<<<<< HEAD
            X
=======
            X (정답)
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
          </label>
        </div>
      )}

<<<<<<< HEAD
      {/* 서술형 */}
=======
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      {data.type === "subjective" && (
        <input
          type="text"
          placeholder="예시 답안 또는 키워드"
          value={data.answer || ""}
          onChange={(e) =>
            handleChange("answer", e.target.value)
          }
          className="subjective-input"
        />
      )}
<<<<<<< HEAD

      {/* 하단 컨트롤 버튼 그룹 */}
      <div className="question-footer-controls">
        <input
          type="number"
          value={data.score}
          min={0}
          onChange={(e) =>
            handleChange("score", parseInt(e.target.value))
          }
          className="score-input"
        />
        <button onClick={() => onMove(index, -1)}>↑</button>
        <button onClick={() => onMove(index, 1)}>↓</button>
        <button
          onClick={onRemove}
          className="question-delete-btn"
        >
          삭제
        </button>
      </div>
=======
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
    </div>
  );
};

export default QuestionCard;
