import React, { useState } from "react";
import "./Signuppage.css";
import { useNavigate } from "react-router-dom"; 

const API_BASE = import.meta.env.VITE_API_URL;

const SignupStu = () => {
  const navigate = useNavigate(); 
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    studentId: "",
    email: "",
    code: "",
  });

  const [idChecked, setIdChecked] = useState(false);
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const [sentCode, setSentCode] = useState(""); // ✅ 전송된 코드 저장
  const [errors, setErrors] = useState({});

  const usernameRegex = /^[a-z0-9_-]{5,20}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const generateRandomCode = () => {
    return Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // ✅ 6자리 숫자
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    switch (name) {
      case "username":
        setErrors((prev) => ({
          ...prev,
          username: !usernameRegex.test(value)
            ? "5~20자, 소문자/숫자/_,-만 사용 가능"
            : "",
        }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: !passwordRegex.test(value)
            ? "8자 이상, 영문+숫자+특수문자 포함"
            : "",
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== form.password
              ? "비밀번호가 일치하지 않습니다."
              : "",
        }));
        break;
      case "email":
        setErrors((prev) => ({
          ...prev,
          email: !emailRegex.test(value)
            ? "유효한 이메일을 입력해주세요."
            : "",
        }));
        break;
      default:
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const checkId = async () => {
    if (!form.username.trim()) {
      setErrors((prev) => ({
        ...prev,
        username: "아이디를 입력해주세요.",
      }));
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE}/students/check-id?studentId=${form.username}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("서버 오류 발생");
      }
  
      const isDuplicate = await response.json(); // 서버에서 true 또는 false가 옴
  
      if (isDuplicate) {
        alert("이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다!");
        setIdChecked(true);
      }
    } catch (error) {
      console.error("ID 중복 확인 에러:", error);
      alert("아이디 중복 확인 중 오류가 발생했습니다.");
    }
  };
  

  const sendVerification = () => {
    if (!emailRegex.test(form.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "유효한 이메일을 입력해주세요.",
      }));
      return;
    }

    const code = generateRandomCode(); // ✅ 새 인증번호 생성
    setSentCode(code);
    alert(
      `인증번호가 이메일로 전송되었습니다: ${code} (모의)`
    );
  };

  const confirmCode = () => {
    if (form.code === sentCode) {
      setCodeConfirmed(true);
      alert("이메일 인증 완료!");
      setErrors((prev) => ({ ...prev, code: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        code: "인증번호가 올바르지 않습니다.",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in form) {
      if (form[key].trim() === "") {
        return alert("모든 항목을 입력해주세요.");
      }
    }

    if (!idChecked)
      return alert("아이디 중복 확인을 해주세요.");
    if (!passwordRegex.test(form.password))
      return alert("비밀번호는 조건을 충족해야 합니다.");
    if (form.password !== form.confirmPassword)
      return alert("비밀번호가 일치하지 않습니다.");
    if (!codeConfirmed)
      return alert("이메일 인증을 완료해주세요.");

  try {
    const response = await fetch(`${API_BASE}/students/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: form.username,   // 서버는 studentId를 원함
        password: form.password,
        name: form.name,
        email: form.email,
        studentNumber: parseInt(form.studentId),
      }),
    });

    if (response.ok) {
      alert("회원가입이 완료되었습니다!");
      console.log("가입정보:", form);
      navigate("/login", { state: { userType: "student" } });
    } else {
      const errorData = await response.text();
      alert("회원가입 실패: " + errorData);
    }
  } catch (error) {
    console.error("회원가입 요청 에러:", error);
    alert("서버 오류가 발생했습니다.");
  }
  };

  const renderInputRow = (
    label,
    name,
    type = "text",
    placeholder,
    extra
  ) => (
    <div className="form-row-wrapper" key={name}>
      <div className="form-row">
        <label>{label}</label>
        <div className="row-with-button">
          <input
            name={name}
            type={type}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
          />
          {extra}
        </div>
      </div>
      {errors[name] && (
        <div className="error-msg">{errors[name]}</div>
      )}
    </div>
  );

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      {renderInputRow(
        "아이디",
        "username",
        "text",
        "5~20자 소문자/숫자/_,-",
        <button type="button" onClick={checkId}>
          중복 확인
        </button>
      )}

      {renderInputRow(
        "비밀번호",
        "password",
        "password",
        "영문+숫자+특수문자 포함 8자 이상"
      )}

      {renderInputRow(
        "비밀번호 확인",
        "confirmPassword",
        "password",
        "비밀번호 재입력"
      )}

      {renderInputRow("이름", "name", "text", "이름 입력")}
      {renderInputRow(
        "학번",
        "studentId",
        "text",
        "학번 입력"
      )}

      {renderInputRow(
        "이메일",
        "email",
        "text",
        "이메일 주소 입력",
        <button type="button" onClick={sendVerification}>
          인증번호
        </button>
      )}

      {renderInputRow(
        "인증번호",
        "code",
        "text",
        "인증번호 입력",
        <button type="button" onClick={confirmCode}>
          확인
        </button>
      )}

      <button type="submit" className="submit-button">
        회원가입
      </button>
    </form>
  );
};

export default SignupStu;
