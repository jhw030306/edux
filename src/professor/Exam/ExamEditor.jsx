import React, { useEffect, useState } from "react";
import ExamQuestions from "./ExamQuestions";
import ExamSettings from "./ExamSettings";
import ExamAccess from "./ExamAccess";
import ExamNotice from "./ExamNotice";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamEditor.css";
import api from "../../api/axios";

const API_BASE = import.meta.env.VITE_API_URL;

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
    questions: [],    // 항상 배열
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
    if (!examId) return;

    // 1) 시험 기본 정보 불러오기
    const fetchExamInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/exams/${examId}`);
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
            duration: data.duration,
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

    // 2) 시험 문제 불러오기
    const fetchQuestions = async () => {
      try {
        const res = await api.get(
          `/exam-questions/exam/all/${examId}`
        );
        // 번호 순 정렬
        const list = res.data.sort(
          (a, b) => a.number - b.number
        );

        // 서버 DTO → 프론트포맷 변환
        const converted = list.map((q) => {
          const base = {
            id: q.id,
            type: q.type,
            question: q.question || "",
            score: q.questionScore ?? 0,
            number: q.number,
          };
          if (q.type === "multiple") {
            const opts = q.distractor || [];
            // DB엔 1-based index 배열로 저장되어 있으니, 0-based로 변환
            const ans = Array.isArray(q.answer)
              ? q.answer.map((idx) => idx - 1)
             : [];
          return { ...base, options: opts, answer: ans };
        }
          if (q.type === "ox") {
            const up = (q.answer || "").toUpperCase();
            return {
              ...base,
              options: ["O", "X"],
              answer:
                up === "O" || up === "X" ? up : null,
            };
          }
          // subjective
          return {
            ...base,
            options: [],
            answer:
              typeof q.answer === "string" ? q.answer : "",
          };
        });

        setExamData((prev) => ({
          ...prev,
          questions: converted,
        }));
      } catch (err) {
        if (err.response?.status === 404) {
          // 문제 하나도 없으면 빈 배열 상태 유지
          setExamData((prev) => ({
            ...prev,
            questions: [],
          }));
        } else {
          console.error("문제 불러오기 실패:", err);
        }
      }
    };

    // 3) 허용 범위 불러오기
    const fetchAccess = () => {
      api
        .get(`/exam-range/${examId}`)
        .then((res) => {
          const { mode, rangeDetails } = res.data;
          setExamData((prev) => ({
            ...prev,
            access: {
              mode,
              allowedSites: rangeDetails,
            },
          }));
        })
        .catch((err) =>
          console.error("허용범위 조회 실패:", err)
        );
    };

    fetchExamInfo();
    fetchQuestions();
    fetchAccess();

  }, [examId]);

  // 로컬 상태 업데이트 헬퍼
  const updateQuestions = (updater) =>
   setExamData(prev => ({
     ...prev,
     questions: typeof updater === "function"
       ? updater(prev.questions)
       : updater
   }));
  const updateSettings = (settings) =>
    setExamData((prev) => ({ ...prev, settings }));
  const updateAccess = (access) =>
    setExamData((prev) => ({ ...prev, access }));
  const updateNotice = (notice) =>
    setExamData((prev) => ({ ...prev, notice }));

  // 전체 저장
  const handleSave = async () => {
    if (!examId) {
      alert("시험 정보가 없습니다.");
      return;
    }

    try {
      // 1) 시험 정보 저장
      const selected = JSON.parse(
        sessionStorage.getItem("selectedExam")
      );
      await fetch(`${API_BASE}/exams/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: examId,
          title: selected?.title || "",
          testStartTime: `${examData.settings.date}T${examData.settings.startTime}`,
          testEndTime: `${examData.settings.date}T${examData.settings.endTime}`,
          notice: examData.notice,
          duration: examData.settings.duration, 
        }),
      });

      // 2) 문제 전체 bulk autosave
      await api.post(
        "/exam-questions/autosave/bulk",
        examData.questions.map((q, idx) => ({
          id: q.id,
          examId,
          number: idx + 1,
          type: q.type,
          question: q.question,
          distractor: q.options,
          answer:
           q.type === "multiple"
             ? Array.isArray(q.answer)
                ? q.answer.map((a) => a + 1)
                : []
              : q.answer,
          questionScore: q.score,
        }))
      );

      // 3) 허용 범위 저장
      await api.post("/exam-range/save", {
        examId,
        mode: examData.access.mode,
        rangeDetails: examData.access.allowedSites,
      });

      // 4) 로컬 번호 재정렬
      setExamData((prev) => ({
        ...prev,
        questions: prev.questions.map((q, i) => ({
          ...q,
          number: i + 1,
        })),
      }));


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
              examId={examId}  
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
