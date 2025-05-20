import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { LectureCard } from "./LectureCard";
import { LectureEnter } from "./LectureEnter";
import { useNavigate } from "react-router-dom";
import "./LectureList.css";

export const StuLectureList = () => {
  const navigate = useNavigate();

  // 학생 수강 강의 리스트 상태
  const [lectures, setLectures] = useState([]);

  // 인증코드 입력 모달 열림 상태
  const [isEnterOpen, setIsEnterOpen] = useState(false);

  const studentLoginId = sessionStorage.getItem(
    "studentLoginId"
  );
  const studentPk = sessionStorage.getItem("studentId");

  const [studentInfo, setStudentInfo] = useState({
    studentNumber: "",
    name: "",
    phoneNumber: "",
  });

  const goToMain = () => {
    navigate("/main");
  };

  // 강의 상세 페이지로 이동하는 함수 (클릭한 강의 정보 전달)
  const goToLecture = (lecture) => {
    navigate("/prolecture-student", { state: { lecture } });
  };

  // 학생 강의 목록 불러오기
  const loadLectures = useCallback(() => {
    fetch(`/api/student-classrooms/${studentLoginId}`)
      .then((res) => {
        if (!res.ok)
          throw new Error("강의 목록 불러오기 실패");
        return res.json();
      })
      .then((data) => setLectures(data))
      .catch((err) =>
        console.error("강의 목록 에러:", err)
      );
  }, [studentLoginId]);

  useEffect(() => {
    if (!studentLoginId || !studentPk) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    loadLectures();

    fetch(`/api/students/${studentPk}`)
      .then((res) => {
        if (!res.ok)
          throw new Error("학생 정보 불러오기 실패");
        return res.json();
      })
      .then((data) =>
        setStudentInfo({
          studentNumber: data.studentNumber,
          name: data.name,
          phoneNumber: data.phoneNumber,
        })
      )
      .catch((err) =>
        console.error("학생 정보 에러:", err)
      );
  }, [studentLoginId, studentPk, navigate, loadLectures]);

  const handleLogout = async () => {
    await fetch("/api/students/logout", {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.removeItem("studentLoginId");
    sessionStorage.removeItem("studentId");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  return (
    <div className="page-container">
      <aside className="sidebar">
        <h1 className="logo" onClick={goToMain}>
          EduX
        </h1>
        <div className="avatar" />
        <p className="logout" onClick={handleLogout}>
          [ 로그아웃 ]
        </p>
        <div className="name">
          {studentInfo.studentNumber}{" "}
          <span className="thin">{studentInfo.name}</span>
        </div>
        <div className="email">
          {studentInfo.phoneNumber}
        </div>
      </aside>

      <main className="main">
        <div className="card-grid">
          {lectures.map((lec) => (
            <LectureCard
              key={lec.id}
              title={lec.className}
              authCode={lec.accessCode}
              section={lec.section}
              schedule={lec.time}
              onClick={() => goToLecture(lec)}
            />
          ))}

          <div
            className="card add-card"
            onClick={() => setIsEnterOpen(true)}
          >
            + 인증코드 입력
          </div>
        </div>
      </main>

      {isEnterOpen && (
        <LectureEnter
          onClose={() => setIsEnterOpen(false)}
          onSubmit={async (newLecture) => {
            await loadLectures();
            setIsEnterOpen(false);
          }}
        />
      )}
    </div>
  );
};
