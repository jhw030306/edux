import { Routes, Route } from "react-router-dom";
import { Mainpage } from "./Mainpage";
import { Loginpage } from "./auth/Loginpage";
import { Signuppage } from "./auth/Signup/Signuppage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Mainpage />} />
      <Route path="/main" element={<Mainpage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/signup" element={<Signuppage />} />
    </Routes>
  );
}

export default App;
