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
    </Routes>
  );
}

export default App;
