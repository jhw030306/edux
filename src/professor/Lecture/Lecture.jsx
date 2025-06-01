import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import { ExamDelete } from "./ExamDelete";
import { useEffect } from "react"; 
import "./Lecture.css";



export const ProLecture = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const goToExam = (exam) => {
    sessionStorage.setItem(
      "selectedExam", 
      JSON.stringify(exam));
    navigate("/exameditor", {
      state: { exam },
    })
  };
  const _lecture = location.state?.lecture;

  const [exams, setExams] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // ✅ 강의 정보 저장 + 시험 목록 로드
  useEffect(() => {
     console.log("📌 useEffect 실행됨", _lecture);
    const fetchExams = async () => {
      const professorId = sessionStorage.getItem("professorId");
      const classroomId = _lecture?.id;
      console.log("교수ID:", professorId, "강의실ID:", classroomId);
      console.log("불러오기 URL:", `/api/exams/${professorId}/${classroomId}/list`);

      try {
        const res = await fetch(`/api/exams/${professorId}/${classroomId}/list`);
        if (!res.ok) throw new Error("시험 목록 불러오기 실패");
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (_lecture) {
      sessionStorage.setItem("selectedLecture", JSON.stringify(_lecture));
      fetchExams();
    }
  }, [_lecture]);

  // ✅ 시험 추가 (API 연동)
  const handleAddExam = async () => {
    const professorId = sessionStorage.getItem("professorId");
    const classroomId = _lecture?.id;

      if (!professorId || !classroomId) {
        alert("교수 ID 또는 강의실 정보가 없습니다.");
        return;
  }

    try {
      const res = await fetch(`/api/exams/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorId,
          classroomId,
          title: "", // 처음엔 빈 제목
          duration: 60 //기본값
        }),
      });

      if (!res.ok) throw new Error("시험 생성 실패");

      const newExam = await res.json();
      setExams([...exams, newExam]);
      setEditingIndex(exams.length);
      setTempName("");
    } catch (err) {
      console.error(err);
    }
  };

  //시험 이름 편집
  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  // ✅ 이름 확정 시 API로 업데이트
  const handleNameConfirm = async () => {
  const newName = tempName.trim();
  if (newName === "") return;

  const exam = exams[editingIndex];
  console.log("수정 요청 데이터:", { id: exam.id, title: newName });

  try {
    const res = await fetch("/api/exams/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: exam.id,
        title: newName,
      }),
    });

    console.log("응답 상태:", res.status);
    const result = await res.text();
    console.log("응답 결과:", result);

    if (!res.ok) throw new Error("시험 수정 실패");

    const updated = [...exams];
    updated[editingIndex].title = newName;
    setExams(updated);
    setEditingIndex(null);
    setTempName("");
  } catch (err) {
    console.error("시험 수정 실패:", err);
  }
};


  const handleDeleteClick = (idx) => {
    setExamToDelete({ idx, name: exams[idx].name });
    setShowDeleteModal(true);
  };

  // const handleConfirmDelete = () => {
  //   const updated = exams.filter(
  //     (_, i) => i !== examToDelete.idx
  //   );
  //   setExams(updated);
  //   setShowDeleteModal(false);
  // };

  //시험 삭제
  const handleConfirmDelete = async () => {
  const deletedExam = exams[examToDelete.idx];

  try {
    // 1) 서버에 삭제 요청
    const response = await fetch(`/api/exams/delete/all/${deletedExam.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`삭제 실패: ${errorText}`);
    }

    // 2) 프론트에서 상태 제거
    const updated = exams.filter((_, i) => i !== examToDelete.idx);
    setExams(updated);

    // 3) 모달 닫기
    setShowDeleteModal(false);
    alert("시험 삭제 완료");
  } catch (error) {
    console.error("시험 삭제 오류:", error);
    alert("시험 삭제 중 오류 발생: " + error.message);
  }
};

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };



  return (
    <MainLayout>
      <div className="page-content">
        {/* 학생 관리 섹션 */}
        <div className="section-box">
          <div className="section-title">학생</div>
          <div className="section-actions">
            <button className="action-button">
              학생 관리
            </button>
            <button className="action-button">
              로그 관리
            </button>
          </div>
        </div>

        {/* 시험 목록 */}
        {exams.map((exam, idx) => (
          <div className="section-box" key={idx}>
            <div className="section-title">
              {editingIndex === idx ? (
                <input
                  className="exam-input"
                  value={tempName}
                  onChange={handleNameChange}
                  onBlur={handleNameConfirm}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleNameConfirm()
                  }
                  autoFocus
                />
              ) : (
                <>
                  {exam.title}
                  <span className="icon-buttons">
                    <img
                      src="/edit2.png"
                      alt="edit"
                      onClick={() => {
                        setEditingIndex(idx);
                        setTempName(exam.title);
                      }}
                    />
                    <img
                      src="/delete2.png"
                      alt="delete"
                      onClick={() => handleDeleteClick(idx)}
                    />
                  </span>
                </>
              )}
            </div>
            <div className="section-actions">
              <button
                className="action-button"
                onClick={() => goToExam(exam)}
              >
                시험 입력
              </button>
              <button className="action-button">
                시험 채점
              </button>
            </div>
          </div>
        ))}

        {/* 시험 추가 버튼 */}
        <div
          className="add-section"
          onClick={handleAddExam}
        >
          +
        </div>

        {/* 삭제 모달 */}
        {showDeleteModal && (
          <ExamDelete
            exam={examToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </MainLayout>
  );
};
