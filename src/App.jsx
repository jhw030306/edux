import { Routes, Route } from "react-router-dom";
import { Mainpage } from "./Mainpage";
import { Loginpage } from "./loginpage";

function App() {
  return (
    <Routes>
      <Route path="/main" element={<Mainpage />} />
      <Route path="/login" element={<Loginpage />} />
    </Routes>
  );
}

export default App;
