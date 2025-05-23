import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layout/MainLayout";
import { ExamDelete } from "./ExamDelete";
import "./Lecture.css";

export const ProLecture = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const goToExam = () => {
    navigate("/exameditor");
  };
  const _lecture = location.state?.lecture;

  const [exams, setExams] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempName, setTempName] = useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // 시험 목록 불러오기 (API 호출)
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch("/api/exams"); // 실제 API 경로 사용
        if (!response.ok)
          throw new Error(
            "시험 목록을 불러오는 데 실패했습니다."
          );
        const data = await response.json();
        setExams(data); // 시험 목록 설정
      } catch (err) {
        console.error("시험 목록 불러오기 실패:", err);
      }
    };

    fetchExams();
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 호출

  // 시험 추가 (API 호출)
  const handleAddExam = async () => {
    const newExam = { name: tempName }; // 새로 추가할 시험 객체
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExam),
      });

      if (!response.ok)
        throw new Error("시험 추가에 실패했습니다.");

      const addedExam = await response.json();
      setExams((prevExams) => [...prevExams, addedExam]); // 새 시험 항목 추가
      setTempName(""); // 입력 필드 초기화
    } catch (err) {
      console.error("시험 추가 실패:", err);
    }
  };

  // 시험 이름 수정
  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameConfirm = () => {
    if (tempName.trim() === "") return;
    const updated = [...exams];
    updated[editingIndex].name = tempName;
    setExams(updated);
    setEditingIndex(null);
    setTempName("");
  };

  // 시험 삭제
  const handleDeleteClick = (idx) => {
    setExamToDelete({ idx, name: exams[idx].name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `/api/exams/${examToDelete.idx}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok)
        throw new Error("시험 삭제에 실패했습니다.");

      const updatedExams = exams.filter(
        (_, i) => i !== examToDelete.idx
      );
      setExams(updatedExams); // 시험 목록에서 삭제된 시험 항목 제거
      setShowDeleteModal(false); // 삭제 모달 닫기
    } catch (err) {
      console.error("시험 삭제 실패:", err);
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
                  {exam.name}
                  <span className="icon-buttons">
                    <img
                      src="/edit2.png"
                      alt="edit"
                      onClick={() => {
                        setEditingIndex(idx);
                        setTempName(exam.name);
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
                onClick={goToExam}
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
