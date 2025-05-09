import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LectureCard } from "./LectureCard";
import { LectureAdd } from "./LectureAdd";
import { LectureDelete } from "./LectureDelete";
import "./LectureList.css";

export const ProLecturepage = () => {
  const navigate = useNavigate();
  const goToMain = () => {
    navigate("/main");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const [lectures, setLectures] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedLecture, setSelectedLecture] =
    useState(null);

  const handleAddLecture = (newLecture) => {
    setLectures([...lectures, newLecture]);
    setIsAddOpen(false);
  };

  const handleEdit = (lecture, index) => {
    setSelectedLecture({ ...lecture, index });
    setEditMode(true);
  };

  const handleDelete = (lecture, index) => {
    setSelectedLecture({ ...lecture, index });
    setDeleteMode(true);
  };

  const handleUpdateLecture = (updatedLecture) => {
    const newLectures = [...lectures];
    newLectures[selectedLecture.index] = updatedLecture;
    setLectures(newLectures);
    setEditMode(false);
    setSelectedLecture(null);
  };

  const confirmDeleteLecture = () => {
    const updated = lectures.filter(
      (_, idx) => idx !== selectedLecture.index
    );
    setLectures(updated);
    setDeleteMode(false);
    setSelectedLecture(null);
  };

  return (
    <div className="page-container">
      <aside className="sidebar">
        <h1 className="logo" onClick={goToMain}>
          EduX
        </h1>
        <div className="avatar" />
        <p className="logout" onClick={goToLogin}>
          [ 로그아웃 ]
        </p>
        <div className="name">
          홍길동 <span className="thin">교수님</span>
        </div>
        <div className="dept">컴퓨터공학과</div>
        <div className="email">abc1234@gmail.com</div>
      </aside>

      <main className="main">
        <div className="card-grid">
          {lectures.map((lecture, idx) => (
            <LectureCard
              key={idx}
              {...lecture}
              onEdit={() => handleEdit(lecture, idx)}
              onDelete={() => handleDelete(lecture, idx)}
            />
          ))}
          <div
            className="card add-card"
            onClick={() => setIsAddOpen(true)}
          >
            + 강의실 추가
          </div>
        </div>
      </main>

      {isAddOpen && (
        <LectureAdd
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAddLecture}
        />
      )}

      {editMode && (
        <LectureAdd
          onClose={() => setEditMode(false)}
          onSubmit={handleUpdateLecture}
          editMode
          initialData={selectedLecture}
        />
      )}

      {deleteMode && selectedLecture && (
        <LectureDelete
          lecture={selectedLecture}
          onConfirm={confirmDeleteLecture}
          onCancel={() => setDeleteMode(false)}
        />
      )}
    </div>
  );
};
