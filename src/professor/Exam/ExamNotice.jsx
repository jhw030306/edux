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
    </div>
  );
};

export default ExamNotice;
