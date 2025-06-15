import { Routes, Route } from "react-router-dom";
import { Mainpage } from "./Mainpage";
import { Loginpage } from "./auth/Loginpage";
import { Signuppage } from "./auth/Signup/Signuppage";
import { Idfindpage } from "./auth/Idfind/idfindpage";
import { Pwfindpage } from "./auth/Pwfind/Pwfindpage";
import { IdfindResultpage } from "./auth/Idfind/IdfindResult";
import { PwfindResultpage } from "./auth/Pwfind/PwfindResult";
import { ProLecturepage } from "./professor/LectureList/LectureList";
import { StuLecturepage } from "./student/LectureList/LectureList";
import { ProLecture } from "./professor/Lecture/Lecture";
import { StuLecture } from "./student/Lecture/Lecture";
import ExamEditor from "./professor/Exam/ExamEditor";
import ExamConsent from "./student/Exam/ExamConsent";
import ExamReady from "./student/Exam/ExamReady";
import ExamOff from "./student/Exam/ExamOff";
import ExamOn from "./student/Exam/ExamOn";
import ExamResult from "./student/Exam/ExamResult";
import ExamFinish from "./student/Exam/ExamFinish";
import { ProctoringPage } from "./professor/Lecture/button/ProctoringPage";
import { LogPage } from "./professor/Lecture/button/LogPage";
import { StudentList } from "./professor/Lecture/button/StudentList";
import Grading from "./professor/Grading/Grading";
import GradingStudent from "./professor/Grading/GradingStudent";
import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const studentId = sessionStorage.getItem("studentLoginId");
      if (!studentId) return;

      const payload = {
        studentId: studentId,
        timestamp: new Date().toISOString(), // 서버에 ISO 포맷으로 전송
      };

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      navigator.sendBeacon("/api/students/logout", blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);


  return (
    <Routes>
      <Route path="/" element={<Mainpage />} />
      <Route path="/main" element={<Mainpage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/signup" element={<Signuppage />} />
      <Route path="/idfind" element={<Idfindpage />} />
      <Route path="/pwfind" element={<Pwfindpage />} />
      <Route
        path="/idresult"
        element={<IdfindResultpage />}
      />
      <Route
        path="/pwresult"
        element={<PwfindResultpage />}
      />
      <Route
        path="/prolecturelist"
        element={<ProLecturepage />}
      />
      <Route
        path="/stulecturelist"
        element={<StuLecturepage />}
      />
      <Route path="/prolecture" element={<ProLecture />} />
      <Route path="/stulecture" element={<StuLecture />} />
      <Route path="/exameditor" element={<ExamEditor />} />
      <Route
        path="/examconsent"
        element={<ExamConsent />}
      />
      <Route path="/examready" element={<ExamReady />} />
      <Route path="/examoff" element={<ExamOff />} />
      <Route path="/examon" element={<ExamOn />} />
      <Route path="/examfinish" element={<ExamFinish />} />
      <Route
        path="/studentlist"
        element={<StudentList />}
      />
      <Route
        path="/proctoring"
        element={<ProctoringPage />}
      />
      <Route path="/grading" element={<Grading />} />
      <Route
        path="/gradingstudent"
        element={<GradingStudent />}
      />
      <Route path="/examresult" element={<ExamResult />} />
      <Route path="/logpage" element={<LogPage />} />
    </Routes>
  );
}

export default App;
