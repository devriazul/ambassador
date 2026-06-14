"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function LandingPage() {
  const { user, login, loginWithGoogle } = useAuth();
  const [modalGoogleError, setModalGoogleError] = useState<string | null>(null);

  // Navigation & UI States
  const [isSticky, setIsSticky] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Registration Form States - Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // Registration OTP flow state
  const [regStep, setRegStep] = useState<"details" | "otp" | "password">("details");
  const [regOtp, setRegOtp] = useState(["", "", "", "", "", ""]);
  const regOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [regVerificationToken, setRegVerificationToken] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Counter States
  const [earningLevelsCount, setEarningLevelsCount] = useState(0);
  const [maxRewardCount, setMaxRewardCount] = useState(0);
  const [tiersCount, setTiersCount] = useState(0);
  const [gdprCount, setGdprCount] = useState(0);

  // Progress Bar State
  const [progressWidth, setProgressWidth] = useState("0%");

  // 3D Card Tilt Refs
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroFloatsRef = useRef<HTMLDivElement | null>(null);
  const heroBadgeRef = useRef<HTMLDivElement | null>(null);

  // Scroll listener for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for elements
  useEffect(() => {
    // Reveal animation
    const reveals = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-s");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    // Progress bar animation
    const progBarParent = document.getElementById("prog-parent");
    if (progBarParent) {
      const progObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setTimeout(() => setProgressWidth("100%"), 300);
            }
          });
        },
        { threshold: 0.4 }
      );
      progObserver.observe(progBarParent);
    }

    // Counter animations
    const statsSection = document.getElementById("stats-section");
    if (statsSection) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animateCounters();
            }
          });
        },
        { threshold: 0.3 }
      );
      counterObserver.observe(statsSection);
    }

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  // Counters animation helper
  function animateCounters() {
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setEarningLevelsCount(Math.round(3 * easeProgress));
      setMaxRewardCount(Math.round(750 * easeProgress));
      setTiersCount(Math.round(4 * easeProgress));
      setGdprCount(Math.round(100 * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  // 3D Card Tilt Effects
  useEffect(() => {
    const isHoverable = !window.matchMedia("(hover:none)").matches;
    if (!isHoverable) return;

    // Glare and Tilt handler for cards
    cardRefs.current.forEach((card) => {
      if (!card) return;
      let glare = card.querySelector(".glare-element") as HTMLDivElement;
      if (!glare) {
        glare = document.createElement("div");
        glare.className = "glare-element";
        glare.style.cssText =
          "position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 0.4s;mix-blend-mode:overlay;z-index:10;border-radius:inherit;";
        card.appendChild(glare);
      }

      const onMouseMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const tiltX = (y - 0.5) * -16;
        const tiltY = (x - 0.5) * 16;
        card.style.transform = `translateY(-8px) scale(1.02) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        glare.style.opacity = "1";
        glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.95) 0%, transparent 65%)`;
      };

      const onMouseLeave = () => {
        card.style.transform = "";
        glare.style.opacity = "0";
      };

      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);

      return () => {
        card.removeEventListener("mousemove", onMouseMove);
        card.removeEventListener("mouseleave", onMouseLeave);
      };
    });

    // Hero Floats 3D effect
    const heroFloats = heroFloatsRef.current;
    const heroBadge = heroBadgeRef.current;
    if (heroFloats && heroBadge) {
      const onHeroMouseMove = (e: MouseEvent) => {
        const r = heroFloats.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        heroFloats.style.transform = `perspective(1500px) rotateX(${-y * 2}deg) rotateY(${x * 2}deg) scale(1.05)`;
        heroBadge.style.transform = `perspective(1500px) rotateX(${y * 8}deg) rotateY(${-x * 8}deg) scale(1.1)`;
      };

      const onHeroMouseLeave = () => {
        heroFloats.style.transform = "";
        heroBadge.style.transform = "";
      };

      heroFloats.addEventListener("mousemove", onHeroMouseMove);
      heroFloats.addEventListener("mouseleave", onHeroMouseLeave);
    }
  }, []);

  // Registration OTP helpers
  const handleRegOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...regOtp];
    updated[index] = value.slice(-1);
    setRegOtp(updated);
    if (value && index < 5) regOtpRefs.current[index + 1]?.focus();
  };
  const handleRegOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !regOtp[index] && index > 0) regOtpRefs.current[index - 1]?.focus();
  };
  const handleRegOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setRegOtp(pasted.split("")); regOtpRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  // Step 1: Initiate – send OTP
  const handleRegisterInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMessage(null);
    try {
      await api.post("/auth/register/initiate", { email, full_name: fullName });
      setRegMessage({ type: "success", text: `A 6-digit OTP was sent to ${email}` });
      setRegStep("otp");
    } catch (err: any) {
      setRegMessage({ type: "error", text: err.message || "Failed to send OTP. Please try again." });
    } finally {
      setRegLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = regOtp.join("");
    if (code.length < 6) { setRegMessage({ type: "error", text: "Enter the complete 6-digit code." }); return; }
    setRegLoading(true);
    setRegMessage(null);
    try {
      const res = await api.post<{ verification_token: string }>("/auth/register/verify", { email, otp: code });
      setRegVerificationToken(res.verification_token);
      setRegMessage({ type: "success", text: "Email verified! Set your password below." });
      setRegStep("password");
    } catch (err: any) {
      setRegMessage({ type: "error", text: err.message || "Invalid or expired OTP." });
    } finally {
      setRegLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 8) { setRegMessage({ type: "error", text: "Password must be at least 8 characters." }); return; }
    setRegLoading(true);
    setRegMessage(null);
    try {
      await api.post("/auth/register/complete", { email, verification_token: regVerificationToken, password: regPassword });
      setRegMessage({ type: "success", text: "Account created! Signing you in..." });
      setTimeout(async () => {
        try { await login(loginEmail || email, regPassword); }
        catch { setIsJoinOpen(false); setIsLoginOpen(true); setRegLoading(false); }
      }, 1200);
    } catch (err: any) {
      setRegMessage({ type: "error", text: err.message || "Registration failed. Please try again." });
      setRegLoading(false);
    }
  };

  const resetRegForm = () => {
    setRegStep("details"); setRegOtp(["","","","","",""]); setRegPassword("");
    setRegVerificationToken(""); setRegMessage(null);
    setFullName(""); setEmail(""); setPhone(""); setSource(""); setTermsAccepted(false);
  };

  const regSubmitHandler = regStep === "details" ? handleRegisterInitiate : regStep === "otp" ? handleRegisterVerify : handleRegisterComplete;

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      // AuthProvider redirects automatically to the right page based on role!
    } catch (err: any) {
      setLoginError(err.message || "Invalid email or password");
      setLoginLoading(false);
    }
  };

  return (
    <div className="bg-white text-slate-800 overflow-x-hidden min-h-screen">
      {/* ══════════ NAVBAR ══════════ */}
      <nav
        id="nav"
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-350 px-4 sm:px-6 py-3 ${
          isSticky
            ? "box-shadow:0 2px 24px rgba(38,58,127,.10) bg-white/97! border-slate-100"
            : "bg-white border-slate-50"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex-shrink-0 flex items-center gap-2">
            <img src="/logo.png" alt="BHE UNI Logo" className="h-10 w-auto object-contain" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-500">
            <a href="#levels" className="hover:text-[var(--primary)] transition-colors">
              Rewards
            </a>
            <a href="#ambassador" className="hover:text-[var(--primary)] transition-colors">
              Tiers
            </a>
            <a href="#app" className="hover:text-[var(--primary)] transition-colors">
              App
            </a>
            <a href="#compliance" className="hover:text-[var(--primary)] transition-colors">
              Compliance
            </a>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="btn-orange text-sm px-5 py-2.5 rounded-full font-bold cursor-pointer"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    setLoginError(null);
                    setIsLoginOpen(true);
                  }}
                  className="text-slate-600 hover:text-[var(--primary)] font-bold text-sm px-4 py-2 transition-colors mr-1"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="btn-orange text-sm px-5 py-2.5 rounded-full font-bold cursor-pointer"
                >
                  Join Now →
                </button>
              </>
            )}
            {/* Hamburger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex flex-col gap-[5px] items-center justify-center w-10 h-10 rounded-xl border border-slate-200"
              aria-label="Menu"
            >
              <span className="block w-5 h-0.5 bg-[var(--primary)] rounded-full"></span>
              <span className="block w-5 h-0.5 bg-[var(--primary)] rounded-full"></span>
              <span className="block w-5 h-0.5 bg-[var(--primary)] rounded-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-[60] bg-black/30 md:hidden transition-opacity duration-300"
        ></div>
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-[70] flex flex-col md:hidden pt-5 px-6 bg-white border-l border-slate-100 shadow-2xl transition-transform duration-300 transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <img src="/logo.png" alt="BHE UNI Logo" className="h-8 w-auto object-contain" />
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          <a
            href="#levels"
            onClick={() => setIsDrawerOpen(false)}
            className="drawer-link py-3.5 px-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-3 text-sm"
          >
            <i className="fa-solid fa-coins text-slate-400"></i> Reward Levels
          </a>
          <a
            href="#ambassador"
            onClick={() => setIsDrawerOpen(false)}
            className="drawer-link py-3.5 px-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-3 text-sm"
          >
            <i className="fa-solid fa-medal text-slate-400"></i> Ambassador Tiers
          </a>
          <a
            href="#app"
            onClick={() => setIsDrawerOpen(false)}
            className="drawer-link py-3.5 px-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-3 text-sm"
          >
            <i className="fa-solid fa-mobile-screen text-slate-400"></i> Mobile App
          </a>
          <a
            href="#compliance"
            onClick={() => setIsDrawerOpen(false)}
            className="drawer-link py-3.5 px-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-3 text-sm"
          >
            <i className="fa-solid fa-shield-halved text-slate-400"></i> Compliance
          </a>
        </nav>
        <div className="mt-auto pb-8 pt-4">
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              onClick={() => setIsDrawerOpen(false)}
              className="btn-orange block w-full py-4 rounded-2xl text-sm font-bold text-center"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setIsJoinOpen(true);
              }}
              className="btn-orange w-full py-4 rounded-2xl text-sm font-bold text-center animate-pulse"
            >
              Apply to Join →
            </button>
          )}
        </div>
      </div>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="hero-section pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle,rgba(129,140,248,.25),transparent 70%)",
            animation: "blobMorph 10s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-0 -left-16 w-64 h-64 rounded-full opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle,rgba(243,113,36,.25),transparent 70%)",
            animation: "blobMorph 8s ease-in-out infinite reverse",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle,rgba(255,255,255,.15),transparent 60%)",
            animation: "blobMorph 12s ease-in-out infinite",
          }}
        ></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10">
          {/* Left Text */}
          <div className="text-center lg:text-left">
            <div style={{ animation: "fadeUp .6s .05s ease both" }}>
              <span
                className="pill mb-6 border border-white/20 shadow-lg text-white"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span className="dot-orange"></span>
                Affiliate &amp; Student Referral Scheme
              </span>
            </div>

            <h1
              className="font-black leading-[1.1] mb-5 sm:mb-6 text-white drop-shadow-2xl"
              style={{
                fontSize: "clamp(2rem, 7vw, 4.5rem)",
                animation: "fadeUp .65s .12s ease both",
              }}
            >
              Monetize Your <br className="hidden lg:block" />
              <span
                style={{
                  background: "linear-gradient(90deg,#ffd0b0 0%,var(--orange) 45%,#ffd0b0 60%,var(--orange) 80%,#ffd0b0 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmerO 3.5s linear infinite",
                }}
              >
                University Network
              </span>
            </h1>

            <p
              className="text-blue-50 leading-relaxed mb-7 sm:mb-10 max-w-lg mx-auto lg:mx-0 font-medium drop-shadow-lg text-sm sm:text-base"
              style={{
                animation: "fadeUp .65s .2s ease both",
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              Turn your connections into real income. Earn for every review, referral, and successful enrolment — with unlimited earning potential.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-7 sm:mb-10"
              style={{ animation: "fadeUp .65s .28s ease both" }}
            >
              {user ? (
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="btn-orange px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-full shadow-[0_0_20px_rgba(243,113,36,0.4)] text-center cursor-pointer"
                >
                  Start Earning Today →
                </Link>
              ) : (
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="btn-orange px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-full shadow-[0_0_20px_rgba(243,113,36,0.4)] text-center cursor-pointer"
                >
                  Start Earning Today →
                </button>
              )}
              <a
                href="#levels"
                className="px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-full font-bold border-2 border-white/20 text-white hover:bg-white/10 hover:border-white transition-all text-center"
              >
                How It Works
              </a>
            </div>

            {/* Goal Pills */}
            <div
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
              style={{ animation: "fadeUp .65s .36s ease both" }}
            >
              <span className="pill border border-white/20 bg-slate-900/50 text-blue-50 backdrop-blur-md shadow-lg">
                <i className="fa-solid fa-bullhorn text-blue-300 mr-1.5"></i> Referrals
              </span>
              <span className="pill border border-white/20 bg-slate-900/50 text-blue-50 backdrop-blur-md shadow-lg">
                <i className="fa-solid fa-star text-orange-400 mr-1.5"></i> Reviews
              </span>
              <span className="pill border border-white/20 bg-slate-900/50 text-blue-50 backdrop-blur-md shadow-lg">
                <i className="fa-solid fa-graduation-cap text-yellow-400 mr-1.5"></i> Enrolment
              </span>
            </div>
          </div>

          {/* Right Floating Bento (Desktop Only) */}
          <div
            ref={heroFloatsRef}
            className="hero-floats hidden lg:block relative h-[560px] w-full"
            style={{ animation: "fadeUp .7s .15s ease both" }}
          >
            {/* Balance Card */}
            <div
              id="hero-badge"
              ref={heroBadgeRef}
              className="absolute top-8 left-0 z-30 w-72 p-6 rounded-[2rem] border border-white/20 float-a"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Earnings</span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
                </span>
              </div>
              <div className="text-5xl font-black text-white mb-2 tracking-tight">
                £1,260<span className="text-2xl text-white/40">.00</span>
              </div>
              <div className="text-emerald-400 text-xs mb-6 font-bold">
                <i className="fa-solid fa-arrow-trend-up mr-1"></i> +£125 this week
              </div>
              <button className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition hover:bg-orange-400">
                Withdraw Funds
              </button>
            </div>

            {/* Activity Card */}
            <div
              className="absolute bottom-6 right-0 z-20 w-80 p-5 rounded-[1.5rem] border border-white/20 float-b"
              style={{
                background: "rgba(38, 58, 127, 0.6)",
                backdropFilter: "blur(32px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <h4 className="text-white font-semibold text-sm mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-xs">UK Enrolment</div>
                    <div className="text-slate-300 text-[10px]">Sarah Jenkins</div>
                  </div>
                  <div className="text-emerald-400 font-black text-sm">+£500</div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-user-plus"></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-xs">Lead Referral</div>
                    <div className="text-slate-300 text-[10px]">James Smith</div>
                  </div>
                  <div className="text-white font-black text-sm">+£5</div>
                </div>
              </div>
            </div>

            {/* Tier Badge */}
            <div
              className="absolute top-16 right-4 z-10 w-48 p-4 rounded-[1.5rem] border border-orange-500/30 float-c"
              style={{
                background: "rgba(243, 113, 36, 0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg shadow-lg shadow-orange-500/40">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <div className="text-orange-300 text-[10px] font-black uppercase tracking-wider">Current Tier</div>
                  <div className="text-white font-bold text-sm">Gold Status</div>
                </div>
              </div>
            </div>

            {/* Live Notification */}
            <div
              className="absolute bottom-28 -left-4 z-40 w-56 p-3 rounded-2xl border border-emerald-500/30 float-d flex items-center gap-3"
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs shadow-lg shadow-emerald-500/40">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <div className="text-white font-bold text-xs">Payout Sent</div>
                <div className="text-emerald-200 text-[10px]">Processed to Bank</div>
              </div>
            </div>
          </div>

          {/* Mobile UI (Visible on Tablet/Mobile) */}
          <div
            className="lg:hidden w-full max-w-lg mx-auto"
            style={{ animation: "fadeUp .7s .4s ease both" }}
          >
            {/* Earnings Summary Card */}
            <div
              className="rounded-2xl p-5 border border-white/15 shadow-2xl relative overflow-hidden mb-4"
              style={{
                background: "rgba(15,23,42,0.75)",
                backdropFilter: "blur(24px)",
              }}
            >
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="text-left">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Earnings</div>
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">£1,260</div>
                  <div className="text-emerald-400 text-xs font-bold mt-1">
                    <i className="fa-solid fa-arrow-trend-up mr-1"></i>+£125 this week
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-500/30 flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Live
                  </span>
                  <div className="text-slate-400 text-xs">Gold Status 🥇</div>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg transition hover:bg-orange-400 relative z-10">
                Withdraw Funds
              </button>
            </div>

            {/* 4-Stat Grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div
                className="rounded-xl p-4 border border-white/10 flex items-center gap-3"
                style={{
                  background: "rgba(15,23,42,0.65)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm flex-shrink-0">
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <div>
                  <div className="text-white font-black text-base">£500</div>
                  <div className="text-slate-400 text-[10px] font-medium">UK Enrolment</div>
                </div>
              </div>
              <div
                className="rounded-xl p-4 border border-white/10 flex items-center gap-3"
                style={{
                  background: "rgba(15,23,42,0.65)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm flex-shrink-0">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <div className="text-white font-black text-base">£750</div>
                  <div className="text-slate-400 text-[10px] font-medium">Intl / Master's</div>
                </div>
              </div>
              <div
                className="rounded-xl p-4 border border-white/10 flex items-center gap-3"
                style={{
                  background: "rgba(15,23,42,0.65)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm flex-shrink-0">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <div className="text-white font-black text-base">£5</div>
                  <div className="text-slate-400 text-[10px] font-medium">Per Lead</div>
                </div>
              </div>
              <div
                className="rounded-xl p-4 border border-white/10 flex items-center gap-3"
                style={{
                  background: "rgba(15,23,42,0.65)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm flex-shrink-0">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div>
                  <div className="text-white font-black text-base">£10</div>
                  <div className="text-slate-400 text-[10px] font-medium">Per Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sep"></div>

      {/* ══════════ AMBASSADOR TIERS ══════════ */}
      <section id="ambassador" className="bg-white-sec py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <span className="pill mb-4" style={{ background: "rgba(243,113,36,.1)", color: "var(--orange)" }}>
              Grow Your Status
            </span>
            <h2 className="font-black text-3xl sm:text-4xl md:text-5xl mb-3" style={{ color: "var(--primary)" }}>
              Ambassador <span className="shimmer-orange">Levels</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              Unlock higher tiers as you refer more students - bonuses and recognition at every level.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12 text-left">
            {/* Bronze */}
            <div
              ref={(el) => { cardRefs.current[6] = el; }}
              className="rounded-2xl overflow-hidden card reveal d1 group cursor-pointer"
            >
              <div className="tier-bronze p-5 sm:p-7 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-award"></i>
                </div>
                <div className="font-black text-lg sm:text-xl">Bronze</div>
                <div className="text-3xl sm:text-4xl font-black mt-1">10</div>
                <div className="text-xs sm:text-sm opacity-80">leads</div>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#cd7f32" }}></i>Official badge
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#cd7f32" }}></i>All reward levels
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#cd7f32" }}></i>App dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#cd7f32" }}></i>Performance bonuses
                  </li>
                </ul>
              </div>
            </div>

            {/* Silver */}
            <div
              ref={(el) => { cardRefs.current[7] = el; }}
              className="rounded-2xl overflow-hidden card reveal d2 group cursor-pointer"
            >
              <div className="tier-silver p-5 sm:p-7 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-medal"></i>
                </div>
                <div className="font-black text-lg sm:text-xl">Silver</div>
                <div className="text-3xl sm:text-4xl font-black mt-1">25</div>
                <div className="text-xs sm:text-sm opacity-80">leads</div>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#aaa" }}></i>Bronze benefits
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#aaa" }}></i>Enhanced rates
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#aaa" }}></i>Priority payout
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#aaa" }}></i>Silver award
                  </li>
                </ul>
              </div>
            </div>

            {/* Gold */}
            <div
              ref={(el) => { cardRefs.current[8] = el; }}
              className="rounded-2xl overflow-hidden reveal d3 group cursor-pointer"
              style={{
                boxShadow: "0 0 0 2px rgba(200,164,18,.45),0 8px 24px rgba(200,164,18,.12)",
              }}
            >
              <div className="tier-gold p-5 sm:p-7 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span className="absolute top-2 right-2 text-[10px] sm:text-xs bg-white/25 font-black px-2 py-0.5 rounded-full">
                  Popular
                </span>
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div className="font-black text-lg sm:text-xl">Gold</div>
                <div className="text-3xl sm:text-4xl font-black mt-1">50</div>
                <div className="text-xs sm:text-sm opacity-80">leads</div>
              </div>
              <div className="bg-white p-4 sm:p-5">
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#c8a412" }}></i>Silver benefits
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#c8a412" }}></i>Max bonus rates
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#c8a412" }}></i>Featured profile
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#c8a412" }}></i>Gold award
                  </li>
                </ul>
              </div>
            </div>

            {/* Platinum */}
            <div
              ref={(el) => { cardRefs.current[9] = el; }}
              className="rounded-2xl overflow-hidden card reveal d4 group cursor-pointer"
            >
              <div className="tier-plat p-5 sm:p-7 text-white text-center relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ background: "linear-gradient(135deg,var(--orange),transparent)" }}
                ></div>
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-regular fa-gem"></i>
                </div>
                <div className="font-black text-lg sm:text-xl">Platinum</div>
                <div className="text-3xl sm:text-4xl font-black mt-1">100+</div>
                <div className="text-xs sm:text-sm opacity-80">leads</div>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#8888b8" }}></i>Gold benefits
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#8888b8" }}></i>Elite award
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#8888b8" }}></i>Direct support
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[10px]" style={{ color: "#8888b8" }}></i>VIP status
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Journey Bar */}
          <div
            ref={(el) => { cardRefs.current[10] = el; }}
            className="card rounded-2xl p-5 sm:p-8 reveal text-left"
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-5">
              Your Journey to Platinum
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2.5">
              <span>Start</span>
              <span className="hidden sm:inline">10 leads</span>
              <span className="hidden sm:inline">25 leads</span>
              <span className="hidden sm:inline">50 leads</span>
              <span>100+ leads</span>
            </div>
            <div id="prog-parent" className="h-3 sm:h-4 rounded-full overflow-hidden bg-slate-100">
              <div
                className="prog-bar h-full rounded-full"
                id="prog"
                style={{
                  width: progressWidth,
                  background: "linear-gradient(90deg,#cd7f32,#c0c0c0 30%,#d4a017 60%,#8b8ba8)",
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-xs font-bold">
              <span style={{ color: "#cd7f32" }}>Bronze</span>
              <span className="hidden sm:inline" style={{ color: "#aaa" }}>
                Silver
              </span>
              <span className="hidden sm:inline" style={{ color: "#c8a412" }}>
                Gold
              </span>
              <span style={{ color: "#8888b8" }}>Platinum</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sep"></div>

      {/* ══════════ REWARD LEVELS ══════════ */}
      <section id="levels" className="bg-tint animated-grid py-16 sm:py-24 px-4 sm:px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <span className="pill mb-4" style={{ background: "rgba(243,113,36,.1)", color: "var(--orange)" }}>
              Three Ways to Earn
            </span>
            <h2 className="font-black text-3xl sm:text-4xl md:text-5xl mb-3" style={{ color: "var(--primary)" }}>
              Reward <span className="shimmer-orange">Levels</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              From a quick review to life-changing referral bonuses - every action earns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-7 max-w-4xl mx-auto text-left">
            {/* L1 - Featured */}
            <div
              className="rounded-2xl overflow-hidden reveal d1 relative text-left"
              style={{
                background: "linear-gradient(160deg,var(--primary),#1c2e6a)",
                boxShadow: "0 20px 60px rgba(38,58,127,.25)",
              }}
            >
              <div className="absolute top-4 right-4 z-10">
                <span className="pill text-white" style={{ background: "var(--orange)" }}>
                  Most Popular
                </span>
              </div>
              <div className="accent-line" style={{ background: "linear-gradient(90deg,var(--orange),#ff8a3a)" }}></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="icon-box" style={{ background: "rgba(243,113,36,.2)", color: "var(--orange)" }}>
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <span className="pill" style={{ background: "rgba(243,113,36,.2)", color: "var(--orange)" }}>
                    Level 1
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Lead Referral</h3>
                <div className="flex items-end gap-1.5 mb-3">
                  <span
                    className="font-black leading-none text-white"
                    style={{ fontSize: "3.5rem", WebkitTextFillColor: "initial", color: "var(--orange)" }}
                  >
                    £5
                  </span>
                  <span className="text-blue-300/60 text-sm mb-2">/ lead</span>
                </div>
                <p className="text-blue-200/70 text-sm leading-relaxed mb-5">
                  Submit qualified leads and earn £5 per valid submission. No cap - unlimited earning potential.
                </p>
                <ul className="space-y-2.5 mb-5">
                  <li className="flex items-center gap-2.5 text-sm text-blue-200/80">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(243,113,36,.25)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#F37124"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Unlimited referrals
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-blue-200/80">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(243,113,36,.25)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#F37124"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    New to BHE Uni &amp; contactable
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-blue-200/80">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(243,113,36,.25)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#F37124"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Interested in higher education
                  </li>
                </ul>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-white" style={{ background: "rgba(243,113,36,.22)" }}>
                  <i className="fa-solid fa-infinity mr-1"></i> <strong style={{ color: "var(--orange)" }}>No limit</strong> on how much you can earn
                </div>
              </div>
            </div>

            {/* L2 */}
            <div
              ref={(el) => { cardRefs.current[5] = el; }}
              className="card rounded-2xl overflow-hidden reveal d2"
            >
              <div className="accent-line" style={{ background: "linear-gradient(90deg,#d4a017,#f5d068)" }}></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="icon-box" style={{ background: "#fefbe8", color: "#9a6f00" }}>
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <span className="pill" style={{ background: "#fefbe8", color: "#9a6f00" }}>
                    Level 2
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2" style={{ color: "var(--primary)" }}>
                  Enrolment Rewards
                </h3>
                <div className="flex items-end gap-1.5 mb-3">
                  <span className="font-black leading-none" style={{ fontSize: "3.5rem", color: "var(--orange)" }}>
                    £500
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">
                  Earn £500 for UK Home students who successfully enrol through your referral.
                </p>
                <div className="space-y-2.5 mb-5">
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "#f8f9fe", border: "1.5px solid #e8edf8" }}
                  >
                    <span className="text-sm text-slate-600 font-medium">UK Home Student</span>
                    <span className="text-xl font-black" style={{ color: "var(--orange)" }}>
                      £500
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-emerald-700"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <i className="fa-solid fa-circle-check mr-1"></i> Paid after verified enrolment
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ══════════ MOBILE APP SECTION ══════════ */}
      <section id="app" className="bg-tint animated-grid py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Phone Mockup */}
          <div className="flex justify-center order-2 lg:order-1 reveal-l">
            <div className="relative w-full max-w-[270px] sm:max-w-[290px]">
              {/* Glow */}
              <div
                className="absolute -inset-8 rounded-full opacity-25 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle,var(--primary),var(--orange))" }}
              ></div>
              <div className="relative rounded-[2.8rem] sm:rounded-[3.2rem] p-2.5 phone-shell float-a">
                <div className="rounded-[2.3rem] sm:rounded-[2.7rem] overflow-hidden" style={{ background: "#0a0e1a" }}>
                  {/* App Header */}
                  <div className="px-5 pt-9 pb-5 relative phone-screen-bg text-left">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-black/40"></div>
                    <div className="flex justify-between text-white/40 text-xs mt-2 mb-4">
                      <span>9:41</span>
                      <span>▌▌▌ ▲</span>
                    </div>
                    <p className="text-white/50 text-xs">Good morning, Alex 👋</p>
                    <h3 className="text-white text-xl font-black mt-0.5">Dashboard</h3>
                    <div className="mt-3 rounded-xl p-4" style={{ background: "rgba(255,255,255,.07)" }}>
                      <div className="text-white/50 text-xs mb-1">Total Earned</div>
                      <div className="text-3xl font-black" style={{ color: "var(--orange)" }}>
                        £1,290
                      </div>
                      <div className="text-emerald-400 text-xs font-semibold mt-1">↑ £125 this month</div>
                    </div>
                  </div>

                  {/* App Stats */}
                  <div className="px-3.5 py-3.5 space-y-2 text-left">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                          Pending
                        </div>
                        <div className="text-white font-extrabold text-sm">£150.00</div>
                      </div>
                      <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                          Approved
                        </div>
                        <div className="text-white font-extrabold text-sm">£1,140.00</div>
                      </div>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
                      <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase tracking-wider mb-2">
                        <span>Tier Progress</span>
                        <span style={{ color: "var(--orange)" }}>15/25 Leads</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div className="h-full rounded-full bg-orange-500" style={{ width: "60%" }}></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2 flex justify-between gap-1.5">
                      <button className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-bold text-[10px] shadow-sm">
                        New Lead
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-white/5 text-white font-bold text-[10px] border border-white/10">
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="text-center lg:text-left order-1 lg:order-2 reveal-r">
            <span className="pill mb-4" style={{ background: "rgba(38,58,127,.1)", color: "var(--primary)" }}>
              Always Connected
            </span>
            <h2 className="font-black text-3xl sm:text-4xl md:text-5xl mb-5 sm:mb-6" style={{ color: "var(--primary)" }}>
              Manage Everything <br />
              On the <span className="shimmer-orange">Ambassador Portal</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg mb-8 leading-relaxed">
              Track referrals live, submit new leads in 10 seconds, monitor your approved payouts, and watch your
              balance grow with our premium Next.js dashboard portal.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 text-left">
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm flex-shrink-0"
                  style={{ color: "var(--primary)", background: "#eef1fb" }}
                >
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Instant Lead Submission</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Submit friends & connections directly on your portal. Simple and GDPR compliant.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-sm flex-shrink-0"
                  style={{ color: "var(--orange)", background: "#fff7f0" }}
                >
                  <i className="fa-solid fa-wallet"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Direct Bank Withdrawals</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Request secure bank transfers of your earnings directly from your dashboard wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sep"></div>

      {/* ══════════ TESTIMONIALS SECTION ══════════ */}
      <section className="bg-white-sec py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <span className="pill mb-4" style={{ background: "rgba(243,113,36,.1)", color: "var(--orange)" }}>
              Success Stories
            </span>
            <h2 className="font-black text-3xl sm:text-4xl md:text-5xl mb-3" style={{ color: "var(--primary)" }}>
              Ambassador <span className="shimmer-orange">Testimonials</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
              See how students are transforming their networks into real earnings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-7 text-left">
            {/* Testimonial 1 */}
            <div
              ref={(el) => { cardRefs.current[11] = el; }}
              className="card rounded-2xl p-6 sm:p-8 reveal d1 flex flex-col h-full"
            >
              <div className="flex gap-1 mb-4 text-orange-400 text-sm">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-sm sm:text-base">
                "I never realized how easy it was to earn by simply referring friends to a university I already trust. The dashboard makes tracking payouts incredibly simple."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                  JD
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    Jessica D.
                  </div>
                  <div className="text-xs text-slate-400">Gold Ambassador</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Featured */}
            <div
              ref={(el) => { cardRefs.current[12] = el; }}
              className="card rounded-2xl p-6 sm:p-8 reveal d2 flex flex-col h-full card-orange"
            >
              <div className="flex gap-1 mb-4 text-orange-400 text-sm">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-sm sm:text-base">
                "The £500 enrolment bonus is game-changing. I referred two students from my previous college and the payout arrived straight to my bank account! Highly recommend this."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold border border-orange-100">
                  MK
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    Michael K.
                  </div>
                  <div className="text-xs text-slate-400">Platinum Ambassador</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div
              ref={(el) => { cardRefs.current[13] = el; }}
              className="card rounded-2xl p-6 sm:p-8 reveal d3 flex flex-col h-full"
            >
              <div className="flex gap-1 mb-4 text-orange-400 text-sm">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-sm sm:text-base">
                "I started just by leaving a quick Trustpilot review for £10. Now I share my referral link on group chats and the passive income really helps with student life expenses."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
                  SA
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    Sarah A.
                  </div>
                  <div className="text-xs text-slate-400">Silver Ambassador</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sep"></div>

      {/* ══════════ JOIN / APPLY SECTION ══════════ */}
      <section id="join" className="bg-tint animated-grid py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[.04] pointer-events-none"
          style={{
            background: "var(--orange)",
            animation: "blobMorph 10s ease-in-out infinite",
            transform: "translate(40%,-40%)",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[.04] pointer-events-none"
          style={{
            background: "var(--primary)",
            animation: "blobMorph 8s ease-in-out infinite reverse",
            transform: "translate(-40%,40%)",
          }}
        ></div>

        <div className="max-w-2xl mx-auto relative z-10 reveal">
          <div className="text-center mb-8 sm:mb-12">
            <span className="pill mb-4 sm:mb-6" style={{ background: "rgba(243,113,36,.1)", color: "var(--orange)" }}>
              Ready to Start?
            </span>
            <h2 className="font-black text-3xl sm:text-4xl md:text-5xl mb-3" style={{ color: "var(--primary)" }}>
              Join <span className="shimmer-orange">BHE Uni</span>
              <br />
              Ambassador Programme
            </h2>
            <p className="text-slate-500 text-base sm:text-lg px-2">Your first referral could be just minutes away.</p>
          </div>

          <form
            onSubmit={regSubmitHandler}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-100 text-left"
            style={{ boxShadow: "0 20px 60px rgba(38,58,127,.09)" }}
          >
            {/* Step progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {["details","otp","password"].map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    regStep === step ? "bg-blue-800 text-white ring-2 ring-blue-300"
                    : (["otp","password"].includes(regStep) && i===0) || (regStep==="password" && i===1) ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                  }`}>
                    {(["otp","password"].includes(regStep) && i===0) || (regStep==="password" && i===1) ? "✓" : i+1}
                  </div>
                  {i < 2 && <div className={`w-8 h-px ${ (["otp","password"].includes(regStep) && i===0)||(regStep==="password"&&i===1) ? "bg-emerald-300" : "bg-slate-200"}`} />}
                </React.Fragment>
              ))}
            </div>

            {regMessage && (
              <div className={`mb-5 p-4 rounded-xl text-sm font-semibold border ${
                regMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>{regMessage.text}</div>
            )}

            {/* Step 1 */}
            {regStep === "details" && (
              <>
                <div className="mb-3"><input type="text" className="f-input" placeholder="Full Name *" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                <div className="mb-3"><input type="email" className="f-input" placeholder="University Email Address *" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="mb-3"><input type="tel" className="f-input" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div className="mb-5"><select className="f-input text-slate-500" value={source} onChange={(e) => setSource(e.target.value)}>
                  <option value="">How did you hear about us?</option>
                  <option value="student_friend">Current Student / Friend</option>
                  <option value="social_media">Social Media</option>
                  <option value="notice_board">University Notice Board</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select></div>
                <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-500 mb-7 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 flex-shrink-0" style={{ accentColor: "var(--primary)" }} required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                  I agree to the BHE Uni Ambassador Programme terms, GDPR data handling, and compliance requirements.
                </label>
              </>
            )}

            {/* Step 2: OTP */}
            {regStep === "otp" && (
              <div className="mb-6">
                <p className="text-sm text-slate-500 text-center mb-4">Enter the 6-digit code sent to <strong className="text-slate-700">{email}</strong></p>
                <div className="flex gap-2 justify-center" onPaste={handleRegOtpPaste}>
                  {regOtp.map((digit, i) => (
                    <input key={i} ref={(el) => { regOtpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleRegOtpChange(i, e.target.value)} onKeyDown={(e) => handleRegOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all" />
                  ))}
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">Didn't receive it? <button type="button" onClick={() => handleRegisterInitiate({ preventDefault: ()=>{} } as any)} className="text-blue-700 font-bold hover:underline">Resend</button></p>
              </div>
            )}

            {/* Step 3: Password */}
            {regStep === "password" && (
              <div className="mb-6">
                <input type="password" className="f-input" placeholder="Create a password (min. 8 characters) *" required minLength={8}
                  value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              </div>
            )}

            <button type="submit" disabled={regLoading} className="btn-navy w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold cursor-pointer">
              {regLoading ? "Processing..." : regStep === "details" ? "Send Verification Code →" : regStep === "otp" ? "Verify Code →" : "Create Account →"}
            </button>
            <p className="text-xs text-slate-400 mt-4 text-center">Applications reviewed within 3–5 working days.</p>
          </form>
        </div>
      </section>

      {/* ══════════ JOIN MODAL ══════════ */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300">
          <div
            onClick={() => setIsJoinOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          ></div>
          <div className="modal-content relative w-full max-w-xl bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl transform scale-100 transition-transform duration-300 mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden text-left">
            <button
              onClick={() => setIsJoinOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center mb-8 relative z-0">
              <span className="pill mb-4" style={{ background: "rgba(243,113,36,.1)", color: "var(--orange)" }}>
                Ready to Start?
              </span>
              <h2 className="font-black text-3xl sm:text-4xl mb-3" style={{ color: "var(--primary)" }}>
                Join <span className="shimmer-orange">BHE Uni</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">Your first referral could be just minutes away.</p>
            </div>

            <form onSubmit={regSubmitHandler} className="space-y-4">
              {/* Step progress */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {["details","otp","password"].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      regStep === step ? "bg-blue-800 text-white ring-2 ring-blue-300"
                      : (["otp","password"].includes(regStep)&&i===0)||(regStep==="password"&&i===1) ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                    }`}>
                      {(["otp","password"].includes(regStep)&&i===0)||(regStep==="password"&&i===1) ? "✓" : i+1}
                    </div>
                    {i < 2 && <div className={`w-6 h-px ${ (["otp","password"].includes(regStep)&&i===0)||(regStep==="password"&&i===1) ? "bg-emerald-300" : "bg-slate-200"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {regMessage && (
                <div className={`p-4 rounded-xl text-sm font-semibold border ${
                  regMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                }`}>{regMessage.text}</div>
              )}

              {/* Step 1: Details */}
              {regStep === "details" && (
                <>
                  <div><input type="text" className="f-input" placeholder="Full Name *" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                  <div><input type="email" className="f-input" placeholder="Email Address *" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div><input type="tel" className="f-input" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  <div><select className="f-input text-slate-500" value={source} onChange={(e) => setSource(e.target.value)}>
                    <option value="">How did you hear about us?</option>
                    <option value="student_friend">Current Student / Friend</option>
                    <option value="social_media">Social Media</option>
                    <option value="notice_board">University Notice Board</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select></div>
                  <label className="flex items-start gap-3 text-xs text-slate-500 cursor-pointer pt-2">
                    <input type="checkbox" className="mt-0.5 flex-shrink-0" style={{ accentColor: "var(--primary)" }} required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span>I agree to the BHE Uni Ambassador Programme terms, GDPR data handling, and compliance requirements.</span>
                  </label>
                </>
              )}

              {/* Step 2: OTP */}
              {regStep === "otp" && (
                <div className="py-2">
                  <p className="text-sm text-slate-500 text-center mb-4">Enter the 6-digit code sent to <strong className="text-slate-700">{email}</strong></p>
                  <div className="flex gap-2 justify-center" onPaste={handleRegOtpPaste}>
                    {regOtp.map((digit, i) => (
                      <input key={i} ref={(el) => { regOtpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleRegOtpChange(i, e.target.value)} onKeyDown={(e) => handleRegOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-700 outline-none transition-all" />
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-3">Didn't receive it? <button type="button" onClick={() => handleRegisterInitiate({ preventDefault: ()=>{} } as any)} className="text-blue-700 font-bold hover:underline">Resend</button></p>
                </div>
              )}

              {/* Step 3: Password */}
              {regStep === "password" && (
                <div><input type="password" className="f-input" placeholder="Create a password (min. 8 characters) *" required minLength={8}
                  value={regPassword} onChange={(e) => setRegPassword(e.target.value)} /></div>
              )}

              <button type="submit" disabled={regLoading} className="btn-navy w-full py-4 sm:py-5 rounded-xl text-sm sm:text-base font-bold mt-4 shadow-lg shadow-blue-900/20 cursor-pointer">
                {regLoading ? "Processing..." : regStep === "details" ? "Send Verification Code →" : regStep === "otp" ? "Verify Code →" : "Create Account →"}
              </button>
              <p className="text-xs text-slate-400 mt-4 text-center">Applications reviewed within 3–5 working days.</p>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ LOGIN MODAL ══════════ */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300">
          <div
            onClick={() => setIsLoginOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          ></div>
          <div className="modal-content relative w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl transform scale-100 transition-transform duration-300 mx-4 text-left">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center mb-8 relative z-0">
              <div className="inline-block p-3 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
                <i className="fa-solid fa-user-shield text-2xl" style={{ color: "var(--primary)" }}></i>
              </div>
              <h2 className="font-black text-3xl sm:text-4xl mb-2" style={{ color: "var(--primary)" }}>
                Ambassador Login
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">Access your dashboard to track earnings.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold text-center">
                  {loginError}
                </div>
              )}
              <div>
                <input
                  type="email"
                  className="f-input font-medium"
                  placeholder="University Email Address *"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  className="f-input font-medium"
                  placeholder="Password *"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="btn-navy w-full py-4 rounded-xl text-sm sm:text-base font-bold mt-2 shadow-lg shadow-blue-900/20 cursor-pointer"
              >
                {loginLoading ? "Signing In..." : "Sign In to Dashboard"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google Button */}
              {modalGoogleError && (
                <p className="text-xs text-red-600 text-center -mt-1">{modalGoogleError}</p>
              )}
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      setModalGoogleError(null);
                      try {
                        await loginWithGoogle(credentialResponse.credential || "");
                      } catch (err: any) {
                        setModalGoogleError(err.message || "Google sign-in failed.");
                      }
                    }}
                    onError={() => setModalGoogleError("Google sign-in was cancelled or failed.")}
                    width="400"
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                  />
                </div>
              </GoogleOAuthProvider>

              <p className="text-xs text-slate-400 pt-1 text-center">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setRegMessage(null);
                    setIsLoginOpen(false);
                    setIsJoinOpen(true);
                  }}
                  className="font-bold text-orange-500 hover:underline"
                >
                  Register Now
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ FOOTER ══════════ */}
      <footer id="compliance" className="relative bg-[#0a0f1c] pt-16 pb-8 px-4 sm:px-6 overflow-hidden border-t border-slate-800 text-left">
        {/* BG Glows */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 pointer-events-none blur-[100px]"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="lg:col-span-1 text-center md:text-left">
            <div className="inline-block bg-white border border-slate-100 rounded-xl px-4 py-2 mb-5 shadow-lg">
              <img src="/logo.png" alt="BHE UNI" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering students to earn through ethical referrals while helping others access higher education globally.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-slate-100 font-bold mb-5 text-sm">Programme</h5>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="#levels" className="hover:text-orange-400 transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-50"></i> Reward Levels
                </a>
              </li>
              <li>
                <a href="#ambassador" className="hover:text-orange-400 transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-50"></i> Ambassador Tiers
                </a>
              </li>
              <li>
                <a href="#app" className="hover:text-orange-400 transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-50"></i> Mobile App
                </a>
              </li>
              <li>
                <a href="#join" className="hover:text-orange-400 transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-50"></i> Apply Now
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-100 font-bold mb-5 text-sm">Legal &amp; Compliance</h5>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/gdpr-policy" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-[12px] opacity-50"></i> GDPR Policy
                </Link>
              </li>
              <li>
                <Link href="/he-regulations" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-scale-balanced text-[12px] opacity-50"></i> HE Regulations
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-file-contract text-[12px] opacity-50"></i> Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors inline-flex items-center gap-2">
                  <i className="fa-solid fa-user-lock text-[12px] opacity-50"></i> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-100 font-bold mb-5 text-sm">Contact Support</h5>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-envelope mt-1 text-slate-500"></i>
                <span>ambassador@bheuni.uk</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot mt-1 text-slate-500"></i>
                <span>11 & 12 Beaufort Court, Admirals Way, Canary Wharf, London, E14 9XL</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All systems operational</span>
          </div>
          <div className="text-center md:text-left">
            &copy; 2026 BHE University. All rights reserved. <span className="hidden md:inline mx-2 text-slate-700">|</span> <br className="md:hidden" />
            Designed for BHE Uni Ambassador Programme
          </div>
        </div>
      </footer>
    </div>
  );
}
