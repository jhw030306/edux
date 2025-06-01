import React, { useRef, useEffect } from "react";
import "./ExamEditor.css";

const ExamNotice = ({ notice, updateNotice }) => {
  const textareaRef = useRef(null);

    const defaultNotice = `시험 중 페이지 이탈 시 자동 제출 됩니다. 단, 응시 시간이 남았다면 재접속이 가능합니다.
시험 시간은 (  )분 이며, 시간 종료 시 자동 제출 됩니다.
부정 행위는 전부 기록 되며, 추후 실격 처리의 근거가 될 수 있습니다.
동시 접속은 불가하며, 기기중 하나는 강제 로그아웃 됩니다.`;
  useEffect(() => {
  if (!notice || notice.trim() === "") {
    updateNotice(defaultNotice);
  }
  autoResize();
  }, [notice]);


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
