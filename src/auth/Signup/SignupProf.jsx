import React, { useState } from "react";
import "./Signuppage.css";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const SignupProf = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    school: "",
    department: "",
    email: "",
    code: "",
  });

  const navigate = useNavigate();
  const [idChecked, setIdChecked] = useState(false);
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const [sentCode, setSentCode] = useState(""); // ✅ 전송된 인증번호 저장
  const [errors, setErrors] = useState({});

  const usernameRegex = /^[a-z0-9_-]{5,20}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const generateRandomCode = () => {
    return Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // ✅ 6자리 랜덤 생성
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

  const checkId = async() => {
    if (!form.username.trim()) {
      setErrors((prev) => ({
        ...prev,
        username: "아이디를 입력해주세요.",
      }));
      return;
    }
    try {
      const response = await api.get("/professors/check-username", {
        params: { username: form.username },
      });

      if (response.data) {
        alert("이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다!");
        setIdChecked(true);
      }
    } catch (error) {
      alert("중복 확인 실패: " + (error.response?.data || error.message));
    }
  };

  const sendVerification = async () => {
    if (!emailRegex.test(form.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "유효한 이메일을 입력해주세요.",
      }));
      return;
    }

    try {
      await api.post("/email/send", { email: form.email });
      alert("이메일로 인증번호가 전송되었습니다.");
    } catch (error) {
      alert("인증번호 전송 실패: " + (error.response?.data || error.message));
    }
  };

  const confirmCode = async () => {
    try {
      const response = await api.post("/email/verify", {
        email: form.email,
        code: form.code,
      });

      alert("이메일 인증 완료!");
      setCodeConfirmed(true);
      setErrors((prev) => ({ ...prev, code: "" }));
    } catch (error) {
      setCodeConfirmed(false);
      setErrors((prev) => ({
        ...prev,
        code: "인증번호가 올바르지 않거나 만료되었습니다.",
      }));
      alert("인증 실패: " + (error.response?.data || error.message));
    }
  };


  const handleSubmit = async(e) => {
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
      const response = await api.post(
        "/professors/register",
        {
          username: form.username,
          password: form.password,
          name: form.name,
          school: form.school,
          department: form.department,
          email: form.email,
        },
        {
          withCredentials: true, // ✅ 핵심: 인증 정보 포함 (세션/쿠키 대응)
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      alert("회원가입이 완료되었습니다!: " + response.data);
      navigate("/login");
    } catch (error) {
      alert("회원가입이 실패했습니다!: " + (error.response?.data || error.message));
    }};
  //   alert("회원가입이 완료되었습니다!");
  //   console.log("가입정보:", form);
  // };

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
        "소속 학교",
        "school",
        "text",
        "학교명 입력"
      )}
      {renderInputRow(
        "학과",
        "department",
        "text",
        "학과명 입력"
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

export default SignupProf;
