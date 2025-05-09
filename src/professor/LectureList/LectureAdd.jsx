import React, { useState } from "react";
import "./LectureList.css";

export const LectureAdd = ({
  onClose,
  onSubmit,
  editMode = false,
  initialData = {},
}) => {
  const [form, setForm] = useState({
    title: initialData.title || "",
    section: initialData.section || "",
    day: initialData.schedule?.split(" ")[0] || "월요일",
    startTime:
      initialData.schedule
        ?.split(" ")[1]
        ?.split("~")[0]
        ?.trim() || "",
    endTime:
      initialData.schedule?.split("~")[1]?.trim() || "",
    authCode:
      initialData.authCode ||
      Math.floor(
        100000 + Math.random() * 900000
      ).toString(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "section") {
      const trimmed = value.trim();
      const result =
        trimmed === ""
          ? ""
          : `${trimmed.replace(/[^0-9]/g, "")}분반`;
      setForm({ ...form, section: result });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = () => {
    const { title, section, day, startTime, endTime } =
      form;
    if (
      !title ||
      !section ||
      !day ||
      !startTime ||
      !endTime
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    const schedule = `${day} ${startTime} ~ ${endTime}`;
    const result = { ...form, schedule };
    onSubmit(result);
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{editMode ? "강의실 수정" : "강의실 등록"}</h2>

        <input
          name="title"
          placeholder="강의명"
          value={form.title}
          onChange={handleChange}
        />
        <input
          name="section"
          placeholder="분반 (숫자만 입력)"
          value={form.section}
          onChange={handleChange}
        />

        <label>요일</label>
        <select
          name="day"
          value={form.day}
          onChange={handleChange}
        >
          <option value="월요일">월요일</option>
          <option value="화요일">화요일</option>
          <option value="수요일">수요일</option>
          <option value="목요일">목요일</option>
          <option value="금요일">금요일</option>
          <option value="토요일">토요일</option>
          <option value="일요일">일요일</option>
        </select>

        <label>시작 시간</label>
        <input
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange}
        />

        <label>종료 시간</label>
        <input
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="submit-btn"
        >
          {editMode ? "수정" : "등록"}
        </button>
      </div>
    </div>
  );
};
