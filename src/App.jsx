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
import ExamReady from "./student/Exam/ExamReady";
import ExamOff from "./student/Exam/ExamOff";
import ExamOn from "./student/Exam/ExamOn";
import ExamResult from "./student/Exam/ExamResult";
import ExamFinish from "./student/Exam/ExamFinish";
import { ProctoringPage } from "./professor/Lecture/button/ProctoringPage";
import { StudentList } from "./professor/Lecture/button/StudentList";
import Grading from "./professor/Grading/Grading";
import GradingStudent from "./professor/Grading/GradingStudent";

function App() {
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
    </Routes>
  );
}

export default App;
