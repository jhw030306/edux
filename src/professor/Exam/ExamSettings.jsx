import React from "react";
import "./ExamEditor.css";

const ExamSettings = ({ settings, updateSettings }) => {
  const handleChange = (field, value) => {
    updateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="settings">
      <div className="row">
        <label>시험 날짜</label>
        <input
          type="date"
          value={settings.date}
          onChange={(e) =>
            handleChange("date", e.target.value)
          }
        />
      </div>

      <div className="row time">
        <label>시험 시간</label>
        <input
          type="time"
          value={settings.startTime}
          onChange={(e) =>
            handleChange("startTime", e.target.value)
          }
        />
        <span className="separator">~</span>
        <input
          type="time"
          value={settings.endTime}
          onChange={(e) =>
            handleChange("endTime", e.target.value)
          }
        />
      </div>

      <div className="row">
        <label>제한 시간 (분)</label>
        <input
          type="number"
          value={settings.duration}
          onChange={(e) =>
            handleChange("duration", Number(e.target.value))
          }
        />
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
        </div>
      )}
    </div>
  );
};

export default ExamSettings;
