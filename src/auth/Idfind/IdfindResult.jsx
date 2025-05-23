import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./IdfindResultpage.css";
import { Button } from "../../components/Button.jsx";

export const IdfindResultpage = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const goToMain = () => {
    navigate("/main");
  };
  
  const {
    name,
    email,
    foundIds = [],
  } = location.state || {};
  
  const [selectedId, setSelectedId] = useState("");

  const handlePasswordFind = () => {
    if (!selectedId) {
      alert("아이디를 선택해주세요!");
      return;
    }
    navigate("/pwfind", {
      state: { id: selectedId, name, email },
    });
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className={`id-find-result ${className || ""}`}>
      <div className="id-find-container">
        <div className="header-logo" onClick={goToMain}>
          EduX
        </div>

        <div className="page-title">아이디 찾기</div>

        {foundIds.length > 0 ? (
          <>
            {foundIds.map((item) => (
              <div className="user-option" key={item.role}>
                <input
                  type="radio"
                  name="userType"
                  value={item.id}
                  checked={selectedId === item.id}
                  onChange={() => setSelectedId(item.id)}
                />
                <span className="user-role">
                  {item.role}
                </span>
                <span className="user-id">{item.id}</span>
              </div>
            ))}
            <div className="idfind-button-wrapper">
              <Button
                text="비밀번호 찾기"
                size="sm"
                onClick={handlePasswordFind}
              />
            </div>
          </>
        ) : (
          <>
            <div className="no-result-text">
              등록된 회원정보가 없습니다.
            </div>
            <div className="no-result-buttons">
              <Button
                text="회원가입 하기"
                size="sm"
                onClick={handleSignup}
              />
              <Button
                text="로그인 하기"
                size="sm"
                onClick={handleLogin}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
