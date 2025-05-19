import React from "react";

const ExamSettings = ({ settings, updateSettings }) => {
  const handleChange = (field, value) => {
    updateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="exam-settings">
      <label>
        시험 일자
        <input
          type="date"
          value={settings.date}
          onChange={(e) =>
            handleChange("date", e.target.value)
          }
        />
      </label>

      <label>
        시작 시간
        <input
          type="time"
          value={settings.startTime}
          onChange={(e) =>
            handleChange("startTime", e.target.value)
          }
        />
      </label>

      <label>
        종료 시간
        <input
          type="time"
          value={settings.endTime}
          onChange={(e) =>
            handleChange("endTime", e.target.value)
          }
        />
      </label>

      <label>
        제한 시간 (분)
        <input
          type="number"
          value={settings.duration}
          onChange={(e) =>
            handleChange("duration", Number(e.target.value))
          }
        />
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
        </label>
      )}
    </div>
  );
};

export default ExamSettings;
