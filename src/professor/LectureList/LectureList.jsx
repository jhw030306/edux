import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LectureCard } from "./LectureCard";
import { LectureAdd } from "./LectureAdd";
import { LectureDelete } from "./LectureDelete";
import "./LectureList.css";
import api from "../../api/axios";


export const ProLecturepage = () => {
  const navigate = useNavigate();
  const professorId = sessionStorage.getItem("professorId");

  const [lectures, setLectures] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  
  const [professorInfo, setProfessorInfo] = useState({
  name: "",
  email: "",
  department: "",
});

   const goToHome = () => {
    // 현재 "/"가 아니면 메인으로, 메인이면 새로고침
     if (window.location.pathname === "/prolecturelist") {
      //  window.location.reload();
      navigate(0);
    } else {
       navigate("/main");
     }
  };

  // 강의 상세 페이지로 이동하는 함수
  // 클릭한 강의 정보를 세션 스토리지에 저장 후 이동
  const goToLecture = (lecture) => {
    sessionStorage.setItem(
      "selectedLecture",
      JSON.stringify(lecture)
    );
    navigate("/prolecture", { // 상세 강의 페이지 경로로 이동
    state: { lecture },
  });
       
  };

  const handleLogout = async () => {
    try {
      await api.post("/professors/logout", {}, { withCredentials: true });
    } catch (e) {
      console.warn("로그아웃 실패:", e);
    }
    sessionStorage.removeItem("professorId");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

   useEffect(() => {
    if (!professorId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchProfessorAndClassrooms = async () => {
      try {
        const profRes = await api.get(`/classrooms/professor/${professorId}`);
        const { name, email, department } = profRes.data;
        setProfessorInfo({ name, email, department });

        const lectureRes = await api.get(`/classrooms/professor/${professorId}/classrooms`);
        const mappedLectures = lectureRes.data.map((lecture) => ({
          ...lecture,
          title: lecture.className,
          schedule: lecture.time,
        }));

        setLectures(mappedLectures);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        alert("강의 정보를 불러오는 데 실패했습니다.");
      }
    };

    fetchProfessorAndClassrooms();
  }, [navigate, professorId]);

  const handleAddLecture = (newLecture) => {
  const lectureWithMappedFields = {
    ...newLecture,
    title: newLecture.className,   // 강의명
    schedule: newLecture.time,     // 시간
  };
  setLectures([...lectures, lectureWithMappedFields]);
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
        <h1 className="logo" onClick={goToHome}>
          EduX
        </h1>
        <div className="avatar" />
        <p className="logout" onClick={handleLogout}>
          [ 로그아웃 ]
        </p>
        <div className="name">
          {professorInfo.name} <span className="thin">교수님</span>
        </div>
        <div className="dept">{professorInfo.department}</div>
        <div className="email">{professorInfo.email}</div>
      </aside>

      <main className="main">
        <div className="card-grid">
          {lectures.map((lecture, idx) => (
            <LectureCard
              key={idx}
              {...lecture}
              onClick={() => goToLecture(lecture)} // 강의 카드 클릭하면 상세 페이지로 이동
              onEdit={() => handleEdit(lecture, idx)} // 수정 버튼 클릭 시
              onDelete={() => handleDelete(lecture, idx)} // 삭제 버튼 클릭 시

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
