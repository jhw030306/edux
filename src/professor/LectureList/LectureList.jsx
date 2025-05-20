import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LectureCard } from "./LectureCard"; // 강의 카드 컴포넌트 (각 강의 정보를 보여주는 UI)
import { LectureAdd } from "./LectureAdd"; // 강의 추가 및 수정 폼 컴포넌트
import { LectureDelete } from "./LectureDelete"; // 강의 삭제 확인 모달 컴포넌트
import "./LectureList.css"; // CSS 스타일
import axios from "axios"; // HTTP 요청 라이브러리 (API 통신용)

export const ProLectureList = () => {
  const navigate = useNavigate(); // 페이지 이동용 훅

  // 강의실 목록 상태 (서버에서 받아온 강의실 정보들을 배열로 저장)
  const [lectures, setLectures] = useState([]);

  // 강의 추가 모달 열림 상태 관리 (true면 강의 추가 폼이 화면에 뜸)
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 강의 수정 모드 상태 (true면 강의 수정 폼이 뜸)
  const [editMode, setEditMode] = useState(false);

  // 강의 삭제 모드 상태 (true면 삭제 확인 모달이 뜸)
  const [deleteMode, setDeleteMode] = useState(false);

  // 수정 또는 삭제 대상 강의 정보를 담는 상태
  // lecture 정보 + lectures 배열 내 인덱스 저장
  const [selectedLecture, setSelectedLecture] =
    useState(null);

  // 교수 정보 상태 (이름, 이메일, 소속 학과)
  const [professorInfo, setProfessorInfo] = useState({
    name: "",
    email: "",
    department: "",
  });

  // 로그인 페이지로 이동하는 함수
  const goToLogin = () => {
    navigate("/login");
  };

  // 메인 페이지로 이동하는 함수
  const goToMain = () => {
    navigate("/main");
  };

  // 강의 상세 페이지로 이동하는 함수
  // 클릭한 강의 정보를 세션 스토리지에 저장 후 이동
  const goToLecture = (lecture) => {
    sessionStorage.setItem(
      "selectedLecture",
      JSON.stringify(lecture)
    );
    navigate("/prolecture"); // 상세 강의 페이지 경로로 이동
  };

  // 컴포넌트가 처음 렌더링될 때 실행됨 (교수 정보 및 강의실 목록 서버에서 불러오기)
  useEffect(() => {
    const fetchProfessorAndClassrooms = async () => {
      const professorId =
        sessionStorage.getItem("professorId");
      if (!professorId) return; // 로그인 안 되어 있으면 함수 종료

      try {
        // 1) 교수 정보 조회 API 호출
        const profRes = await axios.get(
          `/api/classrooms/professor/${professorId}`
        );
        const { name, email, department } = profRes.data;
        setProfessorInfo({ name, email, department }); // 교수 정보 상태 업데이트

        // 2) 교수 강의실 목록 조회 API 호출
        const lectureRes = await axios.get(
          `/api/classrooms/professor/${professorId}/classrooms`
        );

        // 서버에서 받아온 강의실 데이터에 필요한 필드명 매핑
        // className → title, time → schedule
        const mappedLectures = lectureRes.data.map(
          (lecture) => ({
            ...lecture,
            title: lecture.className,
            schedule: lecture.time,
          })
        );

        setLectures(mappedLectures); // 강의실 목록 상태 업데이트
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    fetchProfessorAndClassrooms();
  }, []);

  // 강의 추가 완료 후 호출되는 함수
  // 새로운 강의 객체를 받아서 강의 목록에 추가하고, 추가 폼 닫음
  const handleAddLecture = (newLecture) => {
    // 필드명 맞추기 (className → title, time → schedule)
    const lectureWithMappedFields = {
      ...newLecture,
      title: newLecture.className,
      schedule: newLecture.time,
    };

    setLectures([...lectures, lectureWithMappedFields]);
    setIsAddOpen(false); // 추가 폼 닫기
  };

  // 강의 수정 버튼 클릭 시 호출
  // 선택한 강의와 인덱스를 상태에 저장하고 수정 모드 켬
  const handleEdit = (lecture, index) => {
    setSelectedLecture({ ...lecture, index });
    setEditMode(true);
  };

  // 강의 삭제 버튼 클릭 시 호출
  // 선택한 강의와 인덱스를 상태에 저장하고 삭제 모드 켬
  const handleDelete = (lecture, index) => {
    setSelectedLecture({ ...lecture, index });
    setDeleteMode(true);
  };

  // 강의 수정 완료 후 호출되는 함수
  // 수정된 강의를 강의 목록 상태에 반영하고 수정 모드 종료
  const handleUpdateLecture = (updatedLecture) => {
    const newLectures = [...lectures];
    newLectures[selectedLecture.index] = updatedLecture;
    setLectures(newLectures);
    setEditMode(false);
    setSelectedLecture(null);
  };

  // 강의 삭제 최종 확인 시 호출되는 함수
  // 선택된 강의를 목록에서 제거하고 삭제 모드 종료
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
      {/* 왼쪽 사이드바: 교수 정보, 로그아웃, 메인 이동 */}
      <aside className="sidebar">
        <h1 className="logo" onClick={goToMain}>
          EduX
        </h1>
        <div className="avatar" />
        <p className="logout" onClick={goToLogin}>
          [ 로그아웃 ]
        </p>
        <div className="name">
          {professorInfo.name}{" "}
          <span className="thin">교수님</span>
        </div>
        <div className="dept">
          {professorInfo.department}
        </div>
        <div className="email">{professorInfo.email}</div>
      </aside>

      {/* 메인 영역: 강의 목록 카드 및 추가 카드 */}
      <main className="main">
        <div className="card-grid">
          {/* 강의 목록 카드 반복 출력 */}
          {lectures.map((lecture, idx) => (
            <LectureCard
              key={idx}
              {...lecture}
              onClick={() => goToLecture(lecture)} // 강의 카드 클릭하면 상세 페이지로 이동
              onEdit={() => handleEdit(lecture, idx)} // 수정 버튼 클릭 시
              onDelete={() => handleDelete(lecture, idx)} // 삭제 버튼 클릭 시
            />
          ))}

          {/* 강의 추가 카드: 클릭하면 추가 폼 열림 */}
          <div
            className="card add-card"
            onClick={() => setIsAddOpen(true)}
          >
            + 강의실 추가
          </div>
        </div>
      </main>

      {/* 강의 추가 모달 */}
      {isAddOpen && (
        <LectureAdd
          onClose={() => setIsAddOpen(false)} // 모달 닫기 함수
          onSubmit={handleAddLecture} // 추가 완료 시 호출 함수
        />
      )}

      {/* 강의 수정 모달 */}
      {editMode && (
        <LectureAdd
          onClose={() => setEditMode(false)} // 모달 닫기 함수
          onSubmit={handleUpdateLecture} // 수정 완료 시 호출 함수
          editMode // 수정 모드임을 알림
          initialData={selectedLecture} // 수정할 강의 초기 데이터
        />
      )}

      {/* 강의 삭제 확인 모달 */}
      {deleteMode && selectedLecture && (
        <LectureDelete
          lecture={selectedLecture} // 삭제할 강의 정보 전달
          onConfirm={confirmDeleteLecture} // 삭제 확정 시 호출 함수
          onCancel={() => setDeleteMode(false)} // 삭제 취소 시 호출 함수
        />
      )}
    </div>
  );
};
