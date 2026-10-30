import { Link } from "@tanstack/react-router";
import { useState } from "react";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_FORM = {
  email: "",
  password: "",
};

type LoginFormKey = keyof typeof DEFAULT_FORM;

export function LoginPage() {
  const [form, setForm] = useState(DEFAULT_FORM);

  // 이메일 형식이 맞고 비밀번호를 입력하면 로그인 버튼 활성화
  const isFormValid =
    EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleChangeField = (key: LoginFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    // 폼 제출 시 페이지 새로고침 방지
    e.preventDefault();
    if (!isFormValid) return;

    // 로그인 API 연동 전까지 입력값만 확인
    alert(`${form.email.trim()} 계정으로 로그인을 시도해요.`);
  };

  // noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 끔
  return (
    <main className="flex flex-1 items-center justify-center bg-[#F6F7F9] px-4 py-16">
      <form
        id="login-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-[430px] flex-col gap-4"
      >
        <h1 className="text-[34px] font-bold leading-[41px] tracking-[-1.53px] text-[#17191E]">
          로그인
        </h1>

        <LoginField id="login-email" label="이메일" icon="/icons/mail.svg">
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChangeField("email", e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            className={inputClassName}
          />
        </LoginField>

        <LoginField id="login-password" label="비밀번호" icon="/icons/lock.svg">
          <input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(e) => handleChangeField("password", e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            className={inputClassName}
          />
        </LoginField>

        <button
          type="submit"
          disabled={!isFormValid}
          className="flex h-12 items-center justify-center rounded-lg border border-white bg-[#2563EB] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          로그인
        </button>

        <div className="flex items-end justify-center pt-[5px]">
          <span className="text-[13px] leading-4 text-[#606774]">처음이신가요?&nbsp;</span>
          <Link
            to="/signup"
            className="text-xs font-extrabold leading-[14px] text-[#2563EB]"
          >
            회원가입
          </Link>
        </div>
      </form>
    </main>
  );
}

const inputClassName =
  "min-w-0 flex-1 bg-transparent px-0.5 py-px text-sm leading-[17px] text-[#17191E] placeholder:text-[#969DA8] outline-none";

interface LoginFieldProps {
  id: string;
  label: string;
  icon: string;
  children: React.ReactNode;
}

// 라벨, 아이콘, 입력 상자를 묶은 입력 필드 틀
function LoginField({ id, label, icon, children }: LoginFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-extrabold leading-4 text-[#17191E]">
        {label}
      </label>
      <div className="flex min-h-12 items-center gap-1 rounded-lg border border-[#E3E6EB] bg-white px-[13px] py-3.5 focus-within:border-[#17191E]">
        <img src={icon} alt="" className="h-4 w-4 opacity-70" />
        {children}
      </div>
    </div>
  );
}
