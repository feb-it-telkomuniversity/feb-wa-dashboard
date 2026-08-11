'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { toast } from "sonner"
import api from "@/lib/axios"
import Link from "next/link"
import {
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  LoaderIcon,
  ArrowLeft,
  RotateCcw,
  Mail,
} from "lucide-react"
import { useGoogleLogin } from "@react-oauth/google"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

/* ─────────────────────────── SCHEMAS ─────────────────────────── */
const manualSchema = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(1, "Password tidak boleh kosong"),
})

const emailSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .refine(
      (v) =>
        v.endsWith("@telkomuniversity.ac.id") ||
        v.endsWith("@student.telkomuniversity.ac.id"),
      "Gunakan email resmi Telkom University"
    ),
})

const ssoSchema = z.object({
  username: z.string().min(1, "Username SSO tidak boleh kosong"),
  password: z.string().min(1, "Password SSO tidak boleh kosong"),
})

/* ─────────────────────────── TYPES ─────────────────────────── */
// method: null | 'manual' | 'google' | 'sso' | 'otp'

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [method, setMethod] = useState(null)   // active login method
  const [flipped, setFlipped] = useState(false) // flip card state

  // OTP flow
  const [otpStep, setOtpStep] = useState("email") // 'email' | 'code'
  const [otpEmail, setOtpEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)

  // Google
  const [googleLoading, setGoogleLoading] = useState(false)

  const selectMethod = (m) => {
    setMethod(m)
    requestAnimationFrame(() => setFlipped(true))
  }

  const goBack = () => {
    setFlipped(false)
    setTimeout(() => {
      setMethod(null)
      setOtpStep("email")
      setOtpEmail("")
      setOtp("")
    }, 400) // matches transition duration
  }

  /* ── Google Login ── */
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true)
        const res = await api.post("/api/auth/google", {
          token: tokenResponse.access_token,
        })
        if (res.data.success) {
          login(res.data.user)
          localStorage.setItem("mira_returning_user", "true")
          toast.success(`Halo ${res.data.user.name}! Berhasil masuk dengan Google.`, {
            position: "top-center",
            style: { background: "#059669", color: "#d1fae5" },
          })
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Gagal masuk dengan Google.", {
          position: "top-center",
        })
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => toast.error("Login Google dibatalkan atau gagal."),
  })

  const handleGoogleSelect = () => {
    // check if returning user
    if (typeof window !== "undefined" && localStorage.getItem("mira_returning_user")) {
      loginWithGoogle()
    } else {
      selectMethod("google")
    }
  }

  return (
    /* ── Flip card wrapper ── */
    <div
      className="relative w-full"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ════ FRONT: method selector ════ */}
        <div
          className="w-full"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <FrontFace
            onSelectManual={() => selectMethod("manual")}
            onSelectGoogle={handleGoogleSelect}
            onSelectSSO={() => selectMethod("sso")}
            onSelectOTP={() => selectMethod("otp")}
            googleLoading={googleLoading}
          />
        </div>

        {/* ════ BACK: selected login form ════ */}
        <div
          className="absolute inset-0 w-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <BackFace method={method} onBack={goBack} login={login}
            otpStep={otpStep} setOtpStep={setOtpStep}
            otpEmail={otpEmail} setOtpEmail={setOtpEmail}
            otp={otp} setOtp={setOtp}
            otpLoading={otpLoading} setOtpLoading={setOtpLoading}
          />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FRONT FACE — method picker
══════════════════════════════════════════════════════════════ */
function FrontFace({ onSelectManual, onSelectGoogle, onSelectSSO, onSelectOTP, googleLoading }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-sm text-white/50">
        Pilih cara masuk ke MIRA
      </p>

      {/* ── 3 main method cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <MethodCard
          icon={<UserIcon />}
          label="Akun MIRA"
          sublabel="Email / Username"
          onClick={onSelectManual}
          gradient="from-violet-600/20 to-purple-600/10"
          border="border-violet-500/20"
          ring="hover:ring-violet-500/30"
          iconBg="bg-violet-500/15"
          iconColor="text-violet-300"
        />
        <MethodCard
          icon={<GoogleIcon loading={googleLoading} />}
          label="Google"
          sublabel="Akun Google"
          onClick={onSelectGoogle}
          gradient="from-blue-600/20 to-sky-600/10"
          border="border-blue-500/20"
          ring="hover:ring-blue-500/30"
          iconBg="bg-blue-500/15"
          iconColor=""
        />
        <MethodCard
          icon={<SSOIcon />}
          label="SSO Tel-U"
          sublabel="myTelu"
          onClick={onSelectSSO}
          gradient="from-emerald-600/20 to-teal-600/10"
          border="border-emerald-500/20"
          ring="hover:ring-emerald-500/30"
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-300"
        />
      </div>

      {/* ── Email OTP shortcut ── */}
      <button
        onClick={onSelectOTP}
        className="group flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/50 transition-all hover:border-white/15 hover:bg-white/8 hover:text-white/80"
      >
        <Mail className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
        <span>Masuk via OTP email kampus</span>
      </button>

      <p className="text-center text-[11px] text-white/25 leading-relaxed">
        Masih belum punya akun?{" "}
        <Link
          href="https://wa.me/6282318572605"
          className="underline underline-offset-2 hover:text-white/50 transition-colors"
        >
          Hubungi kami
        </Link>
      </p>
    </div>
  )
}

function MethodCard({ icon, label, sublabel, onClick, gradient, border, ring, iconBg, iconColor }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-2.5 rounded-2xl border ${border} 
        bg-gradient-to-b ${gradient} p-4 pt-5 text-center
        transition-all duration-200 hover:scale-[1.03] hover:ring-2 ${ring}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
      `}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform duration-200 group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-white/90 leading-tight">{label}</p>
        <p className="text-[10px] text-white/35 leading-tight mt-0.5">{sublabel}</p>
      </div>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   BACK FACE — the actual form
══════════════════════════════════════════════════════════════ */
function BackFace({ method, onBack, login, otpStep, setOtpStep, otpEmail, setOtpEmail, otp, setOtp, otpLoading, setOtpLoading }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">
            {method === "manual" && "Masuk dengan Akun MIRA"}
            {method === "sso" && "Masuk dengan SSO Telkom University / myTelu"}
            {method === "otp" && (otpStep === "email" ? "Verifikasi Email Kampus" : "Masukkan Kode OTP")}
            {method === "google" && "Tentang Login Google"}
          </p>
          <p className="text-[11px] text-white/35 leading-tight">
            {method === "manual" && "Username atau email + password MIRA"}
            {method === "sso" && "Gunakan kredensial myTelu"}
            {method === "otp" && "Khusus email @telkomuniversity.ac.id"}
            {method === "google" && ""}
          </p>
        </div>
      </div>

      {/* Dynamic form */}
      {method === "manual" && <ManualLoginForm login={login} />}
      {method === "sso" && <SSOLoginForm login={login} />}
      {method === "otp" && (
        <OTPLoginForm
          login={login}
          step={otpStep} setStep={setOtpStep}
          email={otpEmail} setEmail={setOtpEmail}
          otp={otp} setOtp={setOtp}
          loading={otpLoading} setLoading={setOtpLoading}
        />
      )}
      {method === "google" && <GoogleInfoPanel />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FORMS
══════════════════════════════════════════════════════════════ */

/** Manual login (username + password) */
function ManualLoginForm({ login }) {
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(manualSchema),
  })

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      const res = await api.post("/api/sign-in", data)
      login(res.data.user)
      localStorage.setItem("mira_returning_user", "true")
      toast.success(`Halo ${res.data.user.name}, selamat datang!`, {
        position: "top-center",
        style: { background: "#059669", color: "#d1fae5" },
      })
    } catch (err) {
      setApiError(err.response?.data?.message || "Username atau password salah.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      {apiError && <ErrorBanner>{apiError}</ErrorBanner>}

      <FloatingInput
        id="mira-username"
        label="Username / Email"
        autoComplete="username"
        {...register("username")}
        error={errors.username?.message}
      />
      <div className="relative">
        <FloatingInput
          id="mira-password"
          label="Password"
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-[14px] text-white/30 hover:text-white/60 transition-colors"
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <SubmitButton loading={isSubmitting}>Masuk</SubmitButton>
    </form>
  )
}

/** SSO Telkom University login */
function SSOLoginForm({ login }) {
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ssoSchema),
  })

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      const res = await api.post("/api/auth/sso", data)
      login(res.data.user)
      localStorage.setItem("mira_returning_user", "true")
      toast.success(`Halo ${res.data.user.name}! Berhasil masuk via SSO Telkom.`, {
        position: "top-center",
        style: { background: "#059669", color: "#d1fae5" },
      })
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setApiError("Username atau password SSO tidak valid.")
      else if (status === 503) setApiError("Gateway SSO Telkom University tidak dapat dihubungi saat ini.")
      else setApiError(err.response?.data?.message || "Login SSO gagal. Coba lagi.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      {apiError && <ErrorBanner>{apiError}</ErrorBanner>}

      <FloatingInput
        id="sso-username"
        label="Username myTelu"
        autoComplete="username"
        {...register("username")}
        error={errors.username?.message}
      />
      <div className="relative">
        <FloatingInput
          id="sso-password"
          label="Password SSO"
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-[14px] text-white/30 hover:text-white/60 transition-colors"
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <SubmitButton loading={isSubmitting} color="emerald">
        Masuk via SSO Telkom
      </SubmitButton>

      <p className="text-center text-[11px] text-white/30">
        Gunakan username & password myTelu (portal Telkom University)
      </p>
    </form>
  )
}

/** OTP email kampus login */
function OTPLoginForm({ login, step, setStep, email, setEmail, otp, setOtp, loading, setLoading }) {
  const [apiError, setApiError] = useState(null)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) return setApiError("Email tidak boleh kosong")
    if (!email.endsWith("@telkomuniversity.ac.id") && !email.endsWith("@student.telkomuniversity.ac.id")) {
      return setApiError("Gunakan email resmi Telkom University")
    }
    setApiError(null)
    setLoading(true)
    try {
      await api.post("/api/auth/otp/request", { email })
      setStep("code")
      toast.success("OTP terkirim ke email kampus kamu!", { position: "top-center" })
    } catch (err) {
      setApiError(err.response?.data?.message || "Gagal mengirim OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length < 6) return setApiError("Masukkan 6 digit kode OTP")
    setApiError(null)
    setLoading(true)
    try {
      const res = await api.post("/api/auth/otp/verify", { email, otp })
      login(res.data.user)
      localStorage.setItem("mira_returning_user", "true")
      toast.success(`Halo ${res.data.user.name}! Verifikasi berhasil.`, {
        position: "top-center",
        style: { background: "#059669", color: "#d1fae5" },
      })
    } catch (err) {
      setApiError(err.response?.data?.message || "OTP salah atau kadaluarsa.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleRequestOtp} className="flex flex-col gap-3.5">
        {apiError && <ErrorBanner>{apiError}</ErrorBanner>}
        <FloatingInput
          id="otp-email"
          label="Email Kampus (@telkomuniversity.ac.id)"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SubmitButton loading={loading}>Kirim Kode OTP</SubmitButton>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
      {apiError && <ErrorBanner>{apiError}</ErrorBanner>}
      <p className="text-center text-xs text-white/40">
        Kode OTP dikirim ke <span className="text-white/70 font-medium">{email}</span>
      </p>
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="w-11 h-13 text-xl font-bold border-white/20 text-white bg-white/5" />
            <InputOTPSlot index={1} className="w-11 h-13 text-xl font-bold border-white/20 text-white bg-white/5" />
            <InputOTPSlot index={2} className="w-11 h-13 text-xl font-bold border-white/20 text-white bg-white/5" />
          </InputOTPGroup>
          <InputOTPSeparator className="text-white/30 px-2" />
          <InputOTPGroup>
            <InputOTPSlot index={3} className="w-11 h-13 text-xl font-bold border-white/20 text-white bg-white/5" />
            <InputOTPSlot index={4} className="w-11 h-13 text-xl font-bold border-white/20 text-white bg-white/5" />
            <InputOTPSlot index={5} className="w-11 h-13 text-xl font-bold border-white/20 text-white bg-white/5" />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <SubmitButton loading={loading}>Verifikasi OTP</SubmitButton>
      <button
        type="button"
        onClick={() => { setStep("email"); setOtp(""); setApiError(null) }}
        className="flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mx-auto"
      >
        <RotateCcw className="h-3 w-3" /> Kirim ulang OTP
      </button>
    </form>
  )
}

/** Info panel for Google — shown when first-time user clicks Google */
function GoogleInfoPanel() {
  return (
    <div className="flex flex-col gap-4 text-sm text-white/60 leading-relaxed">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-blue-300/80 text-xs">
        <p className="font-semibold text-blue-200 mb-1">Login Google memerlukan akun yang sudah tertaut</p>
        <p>Untuk keamanan, login dengan Google hanya bisa digunakan setelah akun Google kamu ditautkan di halaman <strong>Account</strong>.</p>
      </div>
      <p className="text-center text-xs text-white/30">
        Silakan masuk dulu dengan metode lain, lalu tautkan akun Google di menu <strong className="text-white/50">Settings → Account</strong>.
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/** Floating label input */
const FloatingInput = ({ id, label, error, className = "", ...props }) => (
  <div className="flex flex-col gap-1">
    <div className="relative">
      <input
        id={id}
        placeholder=" "
        className={`peer h-13 w-full rounded-xl border border-white/10 bg-white/5 px-4 pt-5 pb-2 text-[14px] text-white placeholder-transparent backdrop-blur-sm transition-all
          focus:border-white/30 focus:bg-white/8 focus:outline-none focus:ring-0
          ${error ? "border-red-500/50 focus:border-red-400/50" : ""}
          ${className}`}
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 origin-left text-[14px] font-medium text-white/40 transition-all duration-200
          -translate-y-1.5 scale-75
          peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
          peer-focus:-translate-y-1.5 peer-focus:scale-75 peer-focus:text-white/60"
      >
        {label}
      </label>
    </div>
    {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
  </div>
)

/** Error banner */
const ErrorBanner = ({ children }) => (
  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
    {children}
  </div>
)

/** Submit button */
const SubmitButton = ({ loading, children, color = "default" }) => {
  const colors = {
    default: "bg-white/12 hover:bg-white/18 border-white/15 hover:border-white/25",
    emerald: "bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-500/30 text-emerald-100",
  }
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium text-white transition-all disabled:opacity-50 ${colors[color]}`}
    >
      {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : children}
    </button>
  )
}

/* ── ICON components ── */
const UserIcon = () => <User className="h-5 w-5" />

const GoogleIcon = ({ loading }) =>
  loading ? (
    <LoaderIcon className="h-5 w-5 animate-spin text-white/50" />
  ) : (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )

const SSOIcon = () => <ShieldCheck className="h-5 w-5" />
