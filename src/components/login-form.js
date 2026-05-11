'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Eye, EyeClosed, LoaderIcon } from "lucide-react"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"
import api from "@/lib/axios"

export const loginSchema = z.object({
  username: z.string().min(1, "Username/Email tidak boleh kosong"),
  password: z.string().optional()
}).superRefine((data, ctx) => {
  const isCivitas = data.username.endsWith('@student.telkomuniversity.ac.id') || data.username.endsWith('@telkomuniversity.ac.id')
  if (!isCivitas && (!data.username || data.password.length === 0)) {
    ctx.addIssue({
      code: z.custom,
      message: "Password tidak boleh kosong",
      path: ["password"]
    })
  }
})

export function LoginForm({
  className,
  ...props
}) {
  const [step, setStep] = useState('login')
  const [otpCode, setOtpCode] = useState('')
  const [apiError, setApiError] = useState(null)
  const [pwVisible, setPwVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [savedEmail, setSavedEmail] = useState('')
  const { login } = useAuth()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const watchUsername = watch("username")
  const isStudentEmail = watchUsername?.endsWith('@student.telkomuniversity.ac.id')
  const isStaffEmail = watchUsername?.endsWith('@telkomuniversity.ac.id')

  const loginWithGoogleCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        const res = await api.post('/api/auth/google', {
          token: tokenResponse.access_token
        })

        if (res.data.success) {
          login(res.data.user)
          toast.success("Berhasil masuk dengan Google!", {
            position: 'top-center',
            style: { background: "#059669", color: "#d1fae5" },
            className: "border border-emerald-500"
          })
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Gagal masuk menggunakan Google", {
          position: 'top-center',
          style: { background: "#ef4444", color: "#fee2e2" },
          className: "border border-red-500"
        })
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => console.log('Login Google Dibatalkan/Gagal'),
  })

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      if (isStudentEmail || isStaffEmail) {
        return handleRequestOtp({ preventDefault: () => { } })
      }
      const res = await api.post(`/api/sign-in`, {
        username: data.username,
        password: data.password
      })
      const { user } = res.data
      login(user)
      toast.success(`Halo ${user.name}, selamat datang di MIRA FEB`, {
        position: 'top-center',
        style: { background: "#059669", color: "#d1fae5" },
        className: "border border-emerald-500"
      })

    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        setApiError(error.response.data.message)
      } else {
        setApiError('Terjadi kesalahan pada server. Silakan coba lagi.')
      }
      // console.error("Login failed:", error)
    }
  }

  const onVerifyOtp = async (e) => {
    e.preventDefault()
    if (otpCode.length < 6) return setApiError("Masukkan 6 digit kode OTP")

    setIsLoading(true)
    setApiError(null)
    try {
      const res = await api.post(`/api/auth/otp/verify`, {
        email: savedEmail,
        otp: otpCode
      })
      const { user } = res.data
      login(user)
      toast.success(`Halo ${user.name}, verifikasi berhasil!`, {
        position: 'top-center',
        style: { background: "#059669", color: "#d1fae5" },
        className: "border border-emerald-500"
      })
    } catch (error) {
      setApiError(error.response?.data?.message || 'OTP salah atau kadaluarsa.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()

    if (!watchUsername) return setApiError("Email tidak boleh kosong");

    setIsLoading(true)
    setApiError(null)

    try {
      const res = await api.post(`/api/auth/otp/request`, {
        email: watchUsername
      })
      if (res.data.success) {
        setSavedEmail(watchUsername)
        setStep('otp')
        toast.success("OTP terkirim ke emailmu, cek inbox kamu ya!", {
          position: 'top-center',
          style: { background: "#059669", color: "#d1fae5" },
          className: "border border-emerald-500"
        })
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Gagal mengirim OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-white/70 text-sm text-balance">
            {step === 'login'
              ? "Masuk dulu pakai email kampus kamu. Biar akses informasi makin gampang!"
              : "Masukkan 6 digit kode OTP yang telah dikirim ke email Outlook kampusmu."}
          </p>
        </div>
        {apiError && (
          <div className="text-red-600 text-sm text-center p-3 bg-red-100 rounded-md">
            {apiError}
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Field>
              <div className="relative">
                <Input
                  id="username"
                  placeholder=" "
                  {...register("username")}
                  className="peer h-14 w-full rounded-xl px-4 pt-6 pb-2 text-[15px] text-white border border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/10 focus:outline-none"
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 top-4 text-white text-[15px] font-medium transition-all duration-300 transform origin-left -translate-y-2 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-focus:brightness-150 pointer-events-none"
                >
                  Masukkan email kampus
                </label>
              </div>
              {errors.username && (
                <p className="text-rose-500 text-sm">{errors.username.message}</p>
              )}
            </Field>

            {!isStudentEmail && !isStaffEmail && (
              <Field className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <Link href="https://wa.me/6282318572605" className="text-sm ml-auto underline underline-offset-4 text-white">
                    Lupa dengan passwordmu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    placeholder=" "
                    id="password"
                    type={pwVisible ? "text" : "password"}
                    className="peer h-14 w-full rounded-xl pl-4 pr-10 pt-6 pb-2 text-[15px] text-white border border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/10 focus:outline-none"
                    {...register("password")}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-4 top-4 text-white text-[15px] font-medium transition-all duration-300 transform origin-left -translate-y-2 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-focus:brightness-150 pointer-events-none"
                  >
                    Password
                  </label>
                  <Button
                    type="button"
                    variant="sm"
                    size="icon"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-900 rounded-lg transition-colors"
                    onClick={() => setPwVisible(!pwVisible)}
                  >
                    {pwVisible ? (
                      <Eye className="h-4 w-4 text-white" />
                    ) : (
                      <EyeClosed className="h-4 w-4 text-white" />
                    )}
                    <span className="sr-only">{pwVisible ? "Hide" : "Show"}</span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-sm">{errors.password.message}</p>
                )}
              </Field>
            )}

            <Field>
              <Button disabled={isSubmitting || isLoading} type={isStudentEmail || isStaffEmail ? "button" : "submit"} onClick={isStudentEmail || isStaffEmail ? handleRequestOtp : undefined} className="w-full bg-white/10 border border-white/10 backdrop-blur-2xl hover:bg-[#ff8a8a]/20 rounded-xl">
                {isSubmitting || isLoading ? (
                  <div className="flex justify-center items-center text-center gap-2">
                    <LoaderIcon className="animate-spin size-4" /> <span>Memproses...</span>
                  </div>
                ) : (
                  isStudentEmail || isStaffEmail ? 'Kirim Kode OTP' : 'Masuk'
                )}
              </Button>
            </Field>
          </form>
        )}

        {/* ================= LAYAR 2: FORM VERIFIKASI OTP ================= */}
        {step === 'otp' && (
          <form onSubmit={onVerifyOtp} className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Field className="flex items-center justify-center mx-5">
              <InputOTP
                id="otp"
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-10 h-14 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold border-white/30 text-zinc-200" />
                  <InputOTPSlot index={1} className="w-10 h-14 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold border-white/30 text-zinc-200" />
                  <InputOTPSlot index={2} className="w-10 h-14 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold border-white/30 text-zinc-200" />
                </InputOTPGroup>
                <InputOTPSeparator className="text-white px-1 sm:px-2" />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="w-10 h-14 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold border-white/30 text-zinc-200" />
                  <InputOTPSlot index={4} className="w-10 h-14 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold border-white/30 text-zinc-200" />
                  <InputOTPSlot index={5} className="w-10 h-14 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold border-white/30 text-zinc-200" />
                </InputOTPGroup>
              </InputOTP>
            </Field>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => { setStep('login'); setOtpCode(''); setApiError(null) }}
                className="w-12 bg-white/10 border border-white/10 backdrop-blur-2xl hover:bg-[#ff8a8a]/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button disabled={isLoading} type="submit" className="flex-1 bg-primary text-white hover:bg-primary/70 transition-colors font-medium">
                {isLoading ? <LoaderIcon className="animate-spin size-4" /> : 'Verifikasi OTP'}
              </Button>
            </div>
          </form>
        )}

        {/* <FieldSeparator className="bg-blend-color text-zinc-900 dark:text-white">Atau lanjut saja dengan</FieldSeparator>
        <Field>
          <Button
            disabled={isLoading}
            type="button"
            onClick={() => loginWithGoogleCustom()}
            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-slate-900 border-slate-900 hover:border-zinc-950 hover:bg-zinc-950 shadow-md"
          >
            {isLoading ? (
              <LoaderIcon className="animate-spin size-4" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Masuk dengan Google
          </Button>
          <FieldDescription className="text-center">
            Masih belum punya akun?{" "}
            <Link href="https://wa.me/6282318572605" className="underline underline-offset-4">
              Hubungi kami
            </Link>
          </FieldDescription>
        </Field> */}
      </FieldGroup>
    </div>
  )
}
