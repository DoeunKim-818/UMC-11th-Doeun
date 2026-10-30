import { useState } from "react";
import { cn } from "@/utils/cn";
import { signup } from "@/api/members/signup";
import { Link, useNavigate } from "@tanstack/react-router";
import { checkEmailDuplicate } from "@/api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DuplicateCheckKey = "email" | "nickname";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 입력값의 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작한 필드에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값이 유효하면 제출 버튼 활성화
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 입력 조건과 두 중복 확인을 모두 통과해야 제출 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;
      // 확인한 값을 바꾸면 다시 중복 확인해야 함
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());
      const isAvailable = response.available;
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));
      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };
  
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    // 폼 제출 시 페이지 새로고침 방지
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });
      alert(response.message);
      navigate({ to: "/login" });
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 끔
  return (
    <main className="flex flex-1 items-center justify-center bg-[#F6F7F9] px-4 py-16">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-[430px] flex-col gap-4"
      >
        <h1 className="text-[34px] font-bold leading-[41px] tracking-[-1.53px] text-[#17191E]">
          회원가입
        </h1>

        <SignupField
          id="signup-email"
          label="이메일"
          errorMessage={showEmailError ? "올바른 이메일 형식이 아니에요." : null}
          action={
            <TextLinkButton
              disabled={!isEmailValid || duplicateCheck.email.isChecking}
              onClick={() => handleCheckDuplicate("email")}
            >
              {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
            </TextLinkButton>
          }
        >
          <input
            id="signup-email"
            disabled={duplicateCheck.email.isChecking}
            type="email"
            value={form.email}
            onChange={(e) => handleChangeField("email", e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            className={inputClassName}
          />
        </SignupField>

        <SignupField
          id="signup-nickname"
          label="닉네임"
          errorMessage={showNicknameError ? "닉네임은 2자 이상 12자 이하로 입력해 주세요." : null}
          action={
            <TextLinkButton
              disabled={!isNicknameValid || duplicateCheck.nickname.isChecking}
              onClick={() => handleCheckDuplicate("nickname")}
            >
              {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
            </TextLinkButton>
          }
        >
          <input
            id="signup-nickname"
            disabled={duplicateCheck.nickname.isChecking}
            type="text"
            value={form.nickname}
            onChange={(e) => handleChangeField("nickname", e.target.value)}
            placeholder="2–12자"
            autoComplete="nickname"
            className={inputClassName}
          />
        </SignupField>

        <SignupField
          id="signup-password"
          label="비밀번호"
          // 비밀번호 규칙 안내는 항상 보이고, 규칙에 맞지 않으면 빨간색으로 바뀌어요
          helperText="영문 대·소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요"
          isError={showPasswordError}
        >
          <input
            id="signup-password"
            type="password"
            value={form.password}
            onChange={(e) => handleChangeField("password", e.target.value)}
            placeholder="8자 이상"
            autoComplete="new-password"
            className={inputClassName}
          />
        </SignupField>

        <SignupField
          id="signup-password-confirm"
          label="비밀번호 확인"
          errorMessage={showPasswordConfirmError ? "비밀번호가 일치하지 않아요." : null}
        >
          <input
            id="signup-password-confirm"
            type="password"
            value={form.passwordConfirm}
            onChange={(e) => handleChangeField("passwordConfirm", e.target.value)}
            placeholder="다시 입력"
            autoComplete="new-password"
            className={inputClassName}
          />
        </SignupField>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="flex h-12 items-center justify-center rounded-lg border border-white bg-[#2563EB] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "가입 중" : "가입하기"}
        </button>

        <div className="flex items-end justify-center">
          <span className="text-[13px] leading-4 text-[#606774]">이미 계정이 있나요?&nbsp;</span>
          <Link
            to="/login"
            className="text-xs font-extrabold leading-[14px] text-[#2563EB]"
          >
            로그인
          </Link>
        </div>
      </form>
    </main>
  );
}

const inputClassName =
  "min-w-0 flex-1 bg-transparent disabled:text-[#969DA8] px-0.5 py-px text-sm leading-[17px] text-[#17191E] placeholder:text-[#969DA8] outline-none";

interface SignupFieldProps {
  id: string;
  label: string;
  errorMessage?: string | null;
  helperText?: string;
  isError?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}

// 라벨, 입력 상자, 안내·오류 문구를 묶은 입력 필드 틀
function SignupField({
  id,
  label,
  errorMessage,
  helperText,
  isError = Boolean(errorMessage),
  action,
  children,
}: SignupFieldProps) {
  const message = errorMessage ?? helperText;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[13px] font-extrabold leading-4 text-[#17191E]">
          {label}
        </label>
        <div
          className={cn(
            "flex min-h-12 items-center gap-[9px] rounded-lg border bg-white px-[13px] py-3.5",
            isError
              ? "border-red-500"
              : "border-[#E3E6EB] focus-within:border-[#17191E]",
          )}
        >
          {children}
          {action}
        </div>
      </div>
      {message && (
        <p
          className={cn(
            "text-[11px] leading-[13px]",
            isError ? "text-red-500" : "text-[#969DA8]",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

interface TextLinkButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function TextLinkButton({ disabled, onClick, children }: TextLinkButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 text-xs font-extrabold leading-[14px] text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
