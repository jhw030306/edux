import React, { useEffect, useState } from "react";
import ExamQuestions from "./ExamQuestions";
import ExamSettings from "./ExamSettings";
import ExamAccess from "./ExamAccess";
import ExamNotice from "./ExamNotice";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamEditor.css";

const ExamEditor = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

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

  const examId = JSON.parse(
    sessionStorage.getItem("selectedExam")
  )?.id;

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok)
          throw new Error("시험 정보 불러오기 실패");
        const data = await res.json();

        const toDate = (str) =>
          str ? str.slice(0, 10) : "";
        const toTime = (str) =>
          str ? str.slice(11, 16) : "";

        setExamData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            date: toDate(data.testStartTime),
            startTime: toTime(data.testStartTime),
            endTime: toTime(data.testEndTime),
            duration: prev.settings.duration,
            useSameScore: prev.settings.useSameScore,
            scorePerQuestion:
              prev.settings.scorePerQuestion,
          },
          notice: data.notice || "",
        }));
      } catch (err) {
        console.error("시험 정보 가져오기 실패:", err);
      }
    };

    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/exam-questions/exam/all/${examId}`
        );
        if (!res.ok) throw new Error("문제 불러오기 실패");
        const data = await res.json();

        data.sort((a, b) => a.number - b.number);

        const converted = data.map((q) => {
          const base = {
            id: q.id,
            type: q.type,
            question: q.question,
            score: q.questionScore,
            number: q.number,
          };

          if (q.type === "multiple") {
            const options = q.distractor || [];
            const rawAnswerIndex = Number(q.answer);
            const answerIndex =
              !isNaN(rawAnswerIndex) && rawAnswerIndex > 0
                ? rawAnswerIndex - 1
                : null;

            return {
              ...base,
              options,
              answer: answerIndex,
            };
          }

          if (q.type === "ox") {
            const normalized = (
              q.answer || ""
            ).toUpperCase();
            return {
              ...base,
              options: ["O", "X"],
              answer:
                normalized === "O" || normalized === "X"
                  ? normalized
                  : null,
            };
          }

          if (q.type === "subjective") {
            return {
              ...base,
              answer:
                typeof q.answer === "string"
                  ? q.answer
                  : "",
              options: [],
            };
          }

          return base;
        });

        console.log("📦 변환된 문제 목록:", converted);
        setExamData((prev) => ({
          ...prev,
          questions: converted,
        }));
      } catch (err) {
        console.error("문제 불러오기 실패:", err);
      }
    };

    if (examId) {
      fetchExamInfo();
      fetchQuestions();
    }
  }, [examId]);

  const updateQuestions = (questions) =>
    setExamData((prev) => ({ ...prev, questions }));
  const updateSettings = (settings) =>
    setExamData((prev) => ({ ...prev, settings }));
  const updateAccess = (access) =>
    setExamData((prev) => ({ ...prev, access }));
  const updateNotice = (notice) =>
    setExamData((prev) => ({ ...prev, notice }));

  const handleSave = async () => {
    const examId = JSON.parse(
      sessionStorage.getItem("selectedExam")
    )?.id;
    const selectedExam = JSON.parse(
      sessionStorage.getItem("selectedExam")
    );
    const examTitle = selectedExam?.title || "";

    if (!examId) {
      alert("시험 정보가 없습니다.");
      return;
    }

    try {
      const examInfoRes = await fetch("/api/exams/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: examId,
          title: examTitle,
          testStartTime: `${examData.settings.date}T${examData.settings.startTime}`,
          testEndTime: `${examData.settings.date}T${examData.settings.endTime}`,
          notice: examData.notice,
        }),
      });

      if (!examInfoRes.ok)
        throw new Error("시험 정보 저장 실패");

      alert("📝 시험 저장 완료!");
    } catch (error) {
      console.error("저장 실패:", error);
      alert(
        "저장 중 오류가 발생했습니다: " + error.message
      );
    }
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    console.log("🚀 제출:", examData);
    alert("시험이 제출되었습니다.");
    setShowSubmitModal(false);
  };

  const cancelSubmit = () => {
    setShowSubmitModal(false);
  };

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

        {showSubmitModal && (
          <div className="modal">
            <div className="modal-box">
              <h2>시험 제출</h2>
              <p>시험을 제출하시겠습니까?</p>
              <div className="delete-buttons">
                <button
                  className="submit-btn"
                  onClick={confirmSubmit}
                >
                  제출
                </button>
                <button
                  className="submit-btn"
                  style={{
                    backgroundColor: "#ccc",
                    color: "#333",
                  }}
                  onClick={cancelSubmit}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExamEditor;
