'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderIcon, Eye, EyeClosed, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import api from "@/lib/axios"
import { toast } from "sonner"

export function SSOLoginButton({ className }) {
  const [expanded, setExpanded] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()

  const handleSSO = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError("Username dan password SSO wajib diisi")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.post('/api/auth/sso', { username, password })
      const { user, token } = res.data
      if (token) {
        sessionStorage.setItem("auth_token", token)
      }
      login(user)
      toast.success(`Halo ${user.name}, berhasil masuk via SSO Telkom University!`, {
        position: 'top-center',
        style: { background: "#059669", color: "#d1fae5" },
        className: "border border-emerald-500"
      })
    } catch (err) {
      const msg = err.response?.data?.message
      if (err.response?.status === 401) {
        setError("Username atau password SSO tidak valid. Pastikan Anda menggunakan kredensial myTelkom/SSO.")
      } else if (err.response?.status === 503) {
        setError("Tidak dapat terhubung ke Gateway SSO Telkom University saat ini. Gunakan metode login lain.")
      } else {
        setError(msg || "Login SSO gagal. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="outline"
        className={`w-full bg-white/10 border border-white/10 backdrop-blur-2xl hover:bg-blue-500/20 rounded-xl text-white flex items-center gap-2 justify-center ${className}`}
        onClick={() => setExpanded(true)}
      >
        {/* Telkom University icon (shield) */}
        <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
        <span className="text-sm font-medium">Masuk dengan SSO Telkom University</span>
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSSO}
      className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
        <span className="text-sm font-semibold text-white">SSO Telkom University</span>
        <button
          type="button"
          onClick={() => { setExpanded(false); setError(null); setUsername(""); setPassword("") }}
          className="ml-auto text-xs text-white/50 hover:text-white transition-colors underline"
        >
          Batal
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-xs p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative">
        <Input
          type="text"
          placeholder=" "
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="peer h-12 w-full rounded-xl px-4 pt-5 pb-1.5 text-sm text-white border border-white/10 bg-white/5 backdrop-blur-md focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <label className="absolute left-4 top-3.5 text-white/60 text-xs font-medium transition-all duration-300 transform origin-left -translate-y-2 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 pointer-events-none">
          Username SSO (myTelkom)
        </label>
      </div>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="peer h-12 w-full rounded-xl pl-4 pr-10 pt-5 pb-1.5 text-sm text-white border border-white/10 bg-white/5 backdrop-blur-md focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <label className="absolute left-4 top-3.5 text-white/60 text-xs font-medium transition-all duration-300 transform origin-left -translate-y-2 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 pointer-events-none">
          Password SSO
        </label>
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
        </button>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white rounded-xl h-11 text-sm font-medium transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoaderIcon className="animate-spin h-4 w-4" />
            Memverifikasi SSO...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Masuk via SSO
          </span>
        )}
      </Button>

      <p className="text-center text-[11px] text-white/40 leading-relaxed">
        Gunakan username dan password myTelkom/SSO yang sama dengan portal Telkom University
      </p>
    </form>
  )
}
