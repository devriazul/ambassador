"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";

type Mode = "login" | "register_details" | "register_otp" | "register_password";

export default function StudentLoginPage() {
  const { login, loginWithGoogle } = useAuth();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  // 6-digit OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  // ── Step 1: Initiate Registration → Send OTP ────────────────────────────────
  const handleRegisterInitiate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await api.post("/auth/register/initiate", { email, full_name: fullName });
      setSuccess(`A 6-digit OTP has been sent to ${email}`);
      setMode("register_otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      const res = await api.post<{ verification_token: string }>("/auth/register/verify", {
        email,
        otp: otpCode,
      });
      setVerificationToken(res.verification_token);
      setSuccess("Email verified! Please set your password.");
      setMode("register_password");
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Complete Registration ───────────────────────────────────────────
  const handleRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      await api.post("/auth/register/complete", {
        email,
        verification_token: verificationToken,
        password,
      });
      // Auto login after registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  // ── OTP helpers ─────────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── Step metadata ───────────────────────────────────────────────────────────
  const stepConfig: Record<Mode, { title: string; subtitle: string }> = {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to access your ambassador portal, track referrals, and manage rewards.",
    },
    register_details: {
      title: "Join as Ambassador",
      subtitle: "Enter your details and we'll send a one-time passcode to verify your email.",
    },
    register_otp: {
      title: "Verify Your Email",
      subtitle: `Enter the 6-digit code sent to ${email}`,
    },
    register_password: {
      title: "Set Your Password",
      subtitle: "Almost done! Create a strong password to secure your account.",
    },
  };

  const current = stepConfig[mode];

  const submitHandler =
    mode === "login" ? handleLogin
    : mode === "register_details" ? handleRegisterInitiate
    : mode === "register_otp" ? handleOtpVerify
    : handleRegisterComplete;

  const STEPS: Mode[] = ["register_details", "register_otp", "register_password"];
  const currentStepIdx = STEPS.indexOf(mode);

  // Password strength
  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    if (pwd.length < 8) return { level: 1, label: "Too short", color: "bg-red-500" };
    if (pwd.length < 12) return { level: 2, label: "Moderate", color: "bg-yellow-500" };
    if (pwd.length < 16) return { level: 3, label: "Strong", color: "bg-blue-500" };
    return { level: 4, label: "Very strong", color: "bg-emerald-500" };
  };
  const strength = getStrength(password);

  return (
    <div className={`${theme} bg-slate-950 text-slate-200 min-h-screen flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="text-slate-450 hover:text-blue-500 bg-slate-900/40 border border-slate-800/80 p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-lg"
          aria-label="Toggle Theme"
          type="button"
        >
          {theme === "dark" ? (
            <i className="fa-solid fa-sun text-base text-yellow-500"></i>
          ) : (
            <i className="fa-solid fa-moon text-base text-slate-600"></i>
          )}
        </button>
      </div>

      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white font-extrabold text-3xl group mb-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
              <i className="fa-solid fa-graduation-cap text-white text-lg"></i>
            </div>
            <span>BHE <span className="text-blue-500 font-light">Uni</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">{current.title}</h2>
          <p className="text-slate-400 text-xs mt-1.5 max-w-[320px] mx-auto leading-relaxed">{current.subtitle}</p>
        </div>

        {/* Step progress (register only) */}
        {mode !== "login" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((step, i) => {
              const isCompleted = currentStepIdx > i;
              const isActive = currentStepIdx === i;
              return (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : isActive ? "bg-blue-600 text-white ring-2 ring-blue-500/30 shadow-lg shadow-blue-600/20"
                    : "bg-slate-800 text-slate-500"
                  }`}>
                    {isCompleted ? <i className="fa-solid fa-check text-[10px]"></i> : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-10 h-px transition-all duration-500 ${isCompleted ? "bg-emerald-500/40" : "bg-slate-800"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500" />

          <form onSubmit={submitHandler} className="space-y-5">

            {/* Alerts */}
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-sm shrink-0"></i>
                <span className="leading-tight">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <i className="fa-solid fa-circle-check text-sm shrink-0"></i>
                <span className="leading-tight">{success}</span>
              </div>
            )}

            {/* ── LOGIN fields ── */}
            {mode === "login" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                    <input
                      type="email" required placeholder="alex.m@university.com"
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Link href="/#forgot" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                    <input
                      type={showPassword ? "text" : "password"} required placeholder="••••••••"
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                      <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 1: Name + Email ── */}
            {mode === "register_details" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <i className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                    <input
                      type="text" required placeholder="Alex Mercer"
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    University Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                    <input
                      type="email" required placeholder="alex.m@university.com"
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {mode === "register_otp" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider text-center">
                  Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-slate-950/60 border border-slate-800 text-white rounded-xl outline-none transition-all focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 focus:scale-105 caret-transparent"
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-slate-500 mt-5">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={() => handleRegisterInitiate()}
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-all font-medium"
                  >
                    Resend code
                  </button>
                </p>
              </div>
            )}

            {/* ── STEP 3: Set Password ── */}
            {mode === "register_password" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-600">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="••••••••" minLength={8}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                  </button>
                </div>
                {/* Strength meter */}
                <div className="mt-2.5 flex gap-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div key={lvl} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length > 0 && lvl <= strength.level ? strength.color : "bg-slate-800"
                    }`} />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-xs text-slate-500 mt-1">{strength.label}</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3.5 mt-2 transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner animate-spin"></i><span>Processing...</span></>
              ) : (
                <>
                  <span>
                    {mode === "login" ? "Sign In"
                    : mode === "register_details" ? "Send Verification Code"
                    : mode === "register_otp" ? "Verify Code"
                    : "Create Account"}
                  </span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </>
              )}
            </button>

            {/* Google SSO (login only) */}
            {mode === "login" && (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <hr className="w-full border-slate-800/80" />
                  <span className="absolute bg-[#0d1526] px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">or continue with</span>
                </div>
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      if (credentialResponse.credential) {
                        resetMessages();
                        setLoading(true);
                        try {
                          await loginWithGoogle(credentialResponse.credential);
                        } catch (err: any) {
                          setError(err.message || "Google authentication failed.");
                          setLoading(false);
                        }
                      }
                    }}
                    onError={() => setError("Google authentication failed.")}
                    theme={theme === "dark" ? "filled_dark" : "outline"}
                    shape="circle"
                    width="100%"
                    text="signin_with"
                  />
                </div>
              </>
            )}

            {/* Footer toggle */}
            <p className="text-center text-xs text-slate-400 mt-6 pt-2 leading-relaxed">
              {mode === "login" ? (
                <>
                  Don&apos;t have an ambassador account?{" "}
                  <button type="button" onClick={() => { resetMessages(); setMode("register_details"); }}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all">
                    Apply to join
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => { resetMessages(); setMode("login"); }}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all">
                    Sign In
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
