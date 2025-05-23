import React, { useState } from "react";
import ExamQuestions from "./ExamQuestions";
import ExamSettings from "./ExamSettings";
import ExamAccess from "./ExamAccess";
import ExamNotice from "./ExamNotice";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamEditor.css";

const ExamEditor = () => {
  const [activeTab, setActiveTab] = useState("settings");

  const [examData, setExamData] = useState({
    settings: {
      date: "",
      startTime: "",
      endTime: "",
      duration: 60,
      useSameScore: true,
      scorePerQuestion: 5,
    },
    questions: [],
    access: {
      mode: "deny",
      allowedSites: [],
    },
    notice: "",
  });

  const updateQuestions = (questions) =>
    setExamData((prev) => ({ ...prev, questions }));
  const updateSettings = (settings) =>
    setExamData((prev) => ({ ...prev, settings }));
  const updateAccess = (access) =>
    setExamData((prev) => ({ ...prev, access }));
  const updateNotice = (notice) =>
    setExamData((prev) => ({ ...prev, notice }));

  const handleSave = () =>
    console.log("📝 저장:", examData);
  const handleSubmit = () =>
    console.log("🚀 제출:", examData);

  return (
    <MainLayout>
      <div className="exam-editor">
        <div className="exam-editor-header">
          <div className="tabs">
            <button
              className={
                activeTab === "settings" ? "active" : ""
              }
              onClick={() => setActiveTab("settings")}
            >
              시험 설정
            </button>
            <button
              className={
                activeTab === "questions" ? "active" : ""
              }
              onClick={() => setActiveTab("questions")}
            >
              시험 작성
            </button>

            <button
              className={
                activeTab === "access" ? "active" : ""
              }
              onClick={() => setActiveTab("access")}
            >
              허용 범위
            </button>
            <button
              className={
                activeTab === "notice" ? "active" : ""
              }
              onClick={() => setActiveTab("notice")}
            >
              공지사항
            </button>
          </div>
          <div className="actions">
            <button onClick={handleSave}>저장</button>
            <button onClick={handleSubmit}>제출</button>
          </div>
        </div>

        <div className="exam-editor-body">
          {activeTab === "questions" && (
            <ExamQuestions
              questions={examData.questions}
              setQuestions={updateQuestions}
              settings={examData.settings}
            />
          )}
          {activeTab === "settings" && (
            <ExamSettings
              settings={examData.settings}
              updateSettings={updateSettings}
            />
          )}
          {activeTab === "access" && (
            <ExamAccess
              access={examData.access}
              updateAccess={updateAccess}
            />
          )}
          {activeTab === "notice" && (
            <ExamNotice
              notice={examData.notice}
              updateNotice={updateNotice}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ExamEditor;
