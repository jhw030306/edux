// QuestionCard.jsx
import React from "react";
import "./QuestionCard.css";

const QuestionCard = ({
  index,
  data,
  onUpdate,
  onRemove,
  onMove,
  useSameScore,
}) => {
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
    });
  };

  const toggleAnswer = (i) => {
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

      {data.type === "ox" && (
        <div className="ox-answer">
          <label>
            <input
              type="radio"
              name={`ox-${data.id}`}
              checked={data.answer === "O"}
              onChange={() => handleChange("answer", "O")}
            />
            O (정답)
          </label>
          <label>
            <input
              type="radio"
              name={`ox-${data.id}`}
              checked={data.answer === "X"}
              onChange={() => handleChange("answer", "X")}
            />
            X (정답)
          </label>
        </div>
      )}

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
    </div>
  );
};

export default QuestionCard;
