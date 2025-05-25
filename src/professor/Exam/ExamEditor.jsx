import React, { useEffect, useState } from "react";
import ExamQuestions from "./ExamQuestions";
import ExamSettings from "./ExamSettings";
import ExamAccess from "./ExamAccess";
import ExamNotice from "./ExamNotice";
import { MainLayout } from "../../layout/MainLayout";
import "./ExamEditor.css";
import axios from "axios"

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

    // ✅ 시험 ID 추출
  const examId = JSON.parse(sessionStorage.getItem("selectedExam"))?.id;

  // ✅ 시험 정보 불러오기
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok) throw new Error("시험 정보 불러오기 실패");
        const data = await res.json();

        const toDate = (str) => (str ? str.slice(0, 10) : "");
        const toTime = (str) => (str ? str.slice(11, 16) : "");

        setExamData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            date: toDate(data.testStartTime),
            startTime: toTime(data.testStartTime),
            endTime: toTime(data.testEndTime),
            // 나머지는 그대로 유지하거나 사용자 입력 유도
            duration: prev.settings.duration,
            useSameScore: prev.settings.useSameScore,
            scorePerQuestion: prev.settings.scorePerQuestion,
          },
          notice: data.notice || "",
        }));
      } catch (err) {
        console.error("시험 정보 가져오기 실패:", err);
      }
    };

    //시험 문제 불러오기
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/exam-questions/exam/all/${examId}`);
        if (!res.ok) throw new Error("문제 불러오기 실패");
        const data = await res.json();

          // ✅ 문제 번호순 정렬
        data.sort((a, b) => a.number - b.number);

        const converted = data.map((q) => {
          const base = {
            id: q.id,
            type: q.type,
            question: q.question,
            score: q.questionScore,
            number: q.number  // ✅ 문제 번호 반영
          };

        if (q.type === "multiple") {
          const options = q.distractor || [];

          const rawAnswerIndex = Number(q.answer); // ex: "3" → 3
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
          const normalized = (q.answer || "").toUpperCase();
          return {
            ...base,
            options: ["O", "X"],
            answer: normalized === "O" || normalized === "X" ? normalized : null,
          };
        }

        if (q.type === "subjective") {
          return {
            ...base,
            answer: typeof q.answer === "string" ? q.answer : "",
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

      //허용범위 불러오기
      axios
        .get(`/api/exam-range/${examId}`)
        .then((res) => {
          const { mode, rangeDetails } = res.data;
          setExamData((prev) => ({
           ...prev,
           access: {
            mode,                      
            allowedSites: rangeDetails 
          },
        }));
      })
      .catch((err) =>
        console.error("허용범위 조회 실패:", err)
      );
    }
  }, [examId]);

  const updateQuestions = (questions) =>
    setExamData((prev) => ({ ...prev, questions }));
  const updateSettings = (settings) =>
    setExamData((prev) => ({ ...prev, settings }));
  
  //허용범위 변경 시에는 로컬 상태만 업데이트 (저장 버튼 누를 때 서버로 전송)

  const updateAccess = (newAccess) => {
  setExamData(prev => ({ ...prev, access: newAccess }));
  };


  //공지 변경 시 로컬상태만 업데이트 (저장 버튼 누를 시 서버로 전송)
  const updateNotice = (newNotice) => {
   setExamData(prev => ({ ...prev, notice: newNotice }));
  };

  //저장
  const handleSave = async () => {
  const examId = JSON.parse(sessionStorage.getItem("selectedExam"))?.id;
  const selectedExam = JSON.parse(sessionStorage.getItem("selectedExam"));
  const examTitle = selectedExam?.title || "";

  if (!examId) {
    alert("시험 정보가 없습니다.");
    return;
  }

  try {
    // ✅ 1. 시험 정보 저장
    const examInfoRes = await fetch("/api/exams/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: examId,
        title: examTitle,
        testStartTime: `${examData.settings.date}T${examData.settings.startTime}`,
        testEndTime: `${examData.settings.date}T${examData.settings.endTime}`,
        notice: examData.notice,
      }),
    });

    if (!examInfoRes.ok) throw new Error("시험 정보 저장 실패");

    // 2. 문제 전체 덮어쓰기
      await axios.post("/api/exam-questions/autosave/bulk",
        examData.questions.map((q, idx) => ({
          id: q.id,               // 기존에 있던 id는 덮어쓰기, 없으면 신규 생성
          examId,
          number: idx + 1,
          type: q.type,
          question: q.question,
          distractor: q.options,
          answer: q.type === "multiple"
            ? (Array.isArray(q.answer)
                ? q.answer.map(a => a + 1)
                : q.answer + 1)
            : q.answer,
          questionScore: q.score,
        }))
      );

      // 3. 허용범위 저장
      await axios.post("/api/exam-range/save", {
        examId,
        mode: examData.access.mode, 
        rangeDetails: examData.access.allowedSites,
      });

      // 4. 저장 후 로컬 상태에 문제 번호 다시 붙여주기
     setExamData(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => ({
        ...q,
        number: idx + 1
      }))
    }));

      alert("📝 전체 저장 완료!");
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다: " + error.message);
    }
  };

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
            {/* 일단 임시로 제출버튼도 저장과 똑같은 기능하게 해놓음 나중에 수정할것 */}
            <button onClick={handleSave}>제출</button> 
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
              examId={examId} 
              settings={examData.settings}
              updateSettings={updateSettings}
            />
          )}
          {activeTab === "access" && (
            <ExamAccess
              examId={examId} 
              access={examData.access}
              updateAccess={updateAccess}
            />
          )}
          {activeTab === "notice" && (
            <ExamNotice
              examId={examId} 
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
