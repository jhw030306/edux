<<<<<<< HEAD
import React, { useRef, useEffect } from "react";
import "./ExamEditor.css";

const ExamNotice = ({ notice, updateNotice }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    autoResize();
  }, [notice]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  return (
    <div className="exam-notice settings">
      <div className="row">
        <label>공지사항</label>
        <textarea
          ref={textareaRef}
          className="notice-textarea"
          placeholder="응시자에게 보여질 공지사항을 입력하세요"
          value={notice}
          onChange={(e) => updateNotice(e.target.value)}
          onInput={autoResize}
        />
      </div>
=======
import React from "react";

const ExamNotice = ({ notice, updateNotice }) => {
  return (
    <div className="exam-notice">
      <label>
        공지사항
        <textarea
          placeholder="응시자에게 보여질 공지사항을 입력하세요"
          rows={6}
          value={notice}
          onChange={(e) => updateNotice(e.target.value)}
        />
      </label>
>>>>>>> 756db6263aef1e908a5ad1f6beca8248d4448210
    </div>
  );
};

export default ExamNotice;
