import React, { useState } from "react";
import { AuthLayout } from "../../layout/AuthLayout";
import SignupProf from "./SignupProf";
import SignupStu from "./SignupStu";
import "./Signuppage.css";

export const Signuppage = () => {
  const [userType, setUserType] = useState("professor");

  return (
    <AuthLayout>
      <div className="signup-title">회원가입</div>
      <div className="signup-radio-group">
        <label>
          <input
            type="radio"
            name="userType"
            value="professor"
            checked={userType === "professor"}
            onChange={() => setUserType("professor")}
          />
          출제자
        </label>
        <label>
          <input
            type="radio"
            name="userType"
            value="student"
            checked={userType === "student"}
            onChange={() => setUserType("student")}
          />
          학생
        </label>
      </div>
      <div className="signup-form">
        {userType === "professor" ? (
          <SignupProf />
        ) : (
          <SignupStu />
        )}
      </div>
    </AuthLayout>
  );
};
