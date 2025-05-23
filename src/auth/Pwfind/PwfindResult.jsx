import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PwfindResultpage.css";
import { Button } from "../../components/Button";
import axios from "axios";

export const PwfindResultpage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { id = "", email = "", role = "" } = location.state || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 👁️ 비밀번호 보기 토글 상태
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const goToMain = () => {
    navigate("/main");
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]:;"'|,.<>?/~`]).{8,20}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = async() => {
    if (!id || !email) {
      setErrorMsg("등록된 회원정보가 없습니다.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert(
        "비밀번호는 8~20자, 영문, 숫자, 특수문자를 모두 포함해야 합니다."
      );
      return;
    }

    try {
    let url = "";
    let payload = {};

    if (role === "학생") {
      url = "/api/students/reset-password";
      payload = {
        studentId: id,
        newPassword,
      };
    } else if (role === "교수") {
      url = "/api/professors/reset-password";
      payload = {
        username: id,
        newPassword,
      };
    } else {
      throw new Error("역할 정보가 유효하지 않습니다.");
    }

    await axios.post(url, payload, { withCredentials: true });

    alert("비밀번호가 성공적으로 변경되었습니다!");
    navigate("/login");
  } catch (error) {
    alert("비밀번호 변경에 실패했습니다: " + (error.response?.data || error.message));
  }
};

  return (
    <div className="pwfind-result-page">
      <div className="pwfind-result-container">
        <div
          className="pwfind-result-title"
          onClick={goToMain}
        >
          EduX
        </div>
        <div className="page-title">비밀번호 변경</div>

        {errorMsg ? (
          <div className="error-message">{errorMsg}</div>
        ) : (
          <>
            <div className="id-display">
              <span>아이디: </span>
              <span className="user-id">{id}</span>
            </div>

            <div className="pwfind-result-form">
              <div className="input-group">
                <input
                  type={
                    showNewPassword ? "text" : "password"
                  } // ✨ 토글 적용
                  className="new-input-box"
                  placeholder="새 비밀번호 입력"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="input-group">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  } // ✨ 토글 적용
                  className="new-input-box"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <button
                className="pwfind-button-wrapper"
                onClick={handleResetPassword}
              >
                로그인 하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
