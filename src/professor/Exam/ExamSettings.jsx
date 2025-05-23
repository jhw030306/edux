import React from "react";
<<<<<<< HEAD
import "./ExamEditor.css";
=======
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210

const ExamSettings = ({ settings, updateSettings }) => {
  const handleChange = (field, value) => {
    updateSettings({ ...settings, [field]: value });
  };

  return (
<<<<<<< HEAD
    <div className="settings">
      <div className="row">
        <label>시험 날짜</label>
=======
    <div className="exam-settings">
      <label>
        시험 일자
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
        <input
          type="date"
          value={settings.date}
          onChange={(e) =>
            handleChange("date", e.target.value)
          }
        />
<<<<<<< HEAD
      </div>

      <div className="row time">
        <label>시험 시간</label>
=======
      </label>

      <label>
        시작 시간
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
        <input
          type="time"
          value={settings.startTime}
          onChange={(e) =>
            handleChange("startTime", e.target.value)
          }
        />
<<<<<<< HEAD
        <span className="separator">~</span>
=======
      </label>

      <label>
        종료 시간
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
        <input
          type="time"
          value={settings.endTime}
          onChange={(e) =>
            handleChange("endTime", e.target.value)
          }
        />
<<<<<<< HEAD
      </div>

      <div className="row">
        <label>제한 시간 (분)</label>
=======
      </label>

      <label>
        제한 시간 (분)
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
        <input
          type="number"
          value={settings.duration}
          onChange={(e) =>
            handleChange("duration", Number(e.target.value))
          }
        />
<<<<<<< HEAD
      </div>
      <div className="row checkbox">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.useSameScore}
            onChange={(e) =>
              handleChange("useSameScore", e.target.checked)
            }
          />
          <span>전체 문제 동일 배점 사용</span>
        </label>
      </div>

      {settings.useSameScore && (
        <div className="row">
          <label>각 문제 배점</label>
=======
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.useSameScore}
          onChange={(e) =>
            handleChange("useSameScore", e.target.checked)
          }
        />
        전체 문제 동일 배점 사용
      </label>

      {settings.useSameScore && (
        <label>
          각 문제 배점
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
          <input
            type="number"
            value={settings.scorePerQuestion}
            onChange={(e) =>
              handleChange(
                "scorePerQuestion",
                Number(e.target.value)
              )
            }
          />
<<<<<<< HEAD
        </div>
=======
        </label>
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
      )}
    </div>
  );
};

export default ExamSettings;
