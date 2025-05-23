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
    </div>
  );
};

export default ExamNotice;
