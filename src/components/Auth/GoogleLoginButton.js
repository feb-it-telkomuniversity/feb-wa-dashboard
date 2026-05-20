'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { LoaderIcon, ShieldAlert } from "lucide-react"
import { useGoogleLogin } from "@react-oauth/google"
import api from "@/lib/axios"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ButtonWithIconDemo from '../shadcn-space/button/button-01'

export function GoogleLoginButton({ onManualLoginFocus }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showInterceptModal, setShowInterceptModal] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 0 })
  const { login } = useAuth()
  const contentRef = useRef(null)

  const loginWithGoogleCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        const res = await api.post('/api/auth/google', {
          token: tokenResponse.access_token
        })

        if (res.data.success) {
          login(res.data.user)
          if (typeof window !== 'undefined') localStorage.setItem('mira_returning_user', 'true')
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

  const handleGoogleClick = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('mira_returning_user')) {
      setShowInterceptModal(true)
    } else {
      loginWithGoogleCustom()
    }
  }

  const handleMouseMove = (e) => {
    if (!contentRef.current) return
    const rect = contentRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <>
      <Button
        disabled={isLoading}
        type="button"
        onClick={handleGoogleClick}
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

      <Dialog open={showInterceptModal} onOpenChange={setShowInterceptModal}>
        <DialogContent
          ref={contentRef}
          onMouseMove={handleMouseMove}
          className="sm:max-w-md bg-slate-950 border border-white/10 text-white p-0 overflow-hidden shadow-2xl transition-all duration-300"
        >
          {/* Dynamic Border Accents */}
          {/* Top */}
          <div
            className="absolute top-0 inset-x-0 h-px transition-all duration-150 ease-out pointer-events-none z-10"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}%, rgba(56, 189, 248, 0.9), transparent 80%)`,
              opacity: Math.max(0, 1 - mousePosition.y / 100),
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}
          />
          {/* Bottom */}
          <div
            className="absolute bottom-0 inset-x-0 h-px transition-all duration-150 ease-out pointer-events-none z-10"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}%, rgba(56, 189, 248, 0.9), transparent 80%)`,
              opacity: Math.max(0, (mousePosition.y - 75) / 100),
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}
          />
          {/* Left */}
          <div
            className="absolute left-0 inset-y-0 w-px transition-all duration-150 ease-out pointer-events-none z-10"
            style={{
              background: `radial-gradient(200px circle at 0% ${mousePosition.y}%, rgba(56, 189, 248, 0.9), transparent 80%)`,
              opacity: Math.max(0, 1 - mousePosition.x / 100),
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}
          />
          {/* Right */}
          <div
            className="absolute right-0 inset-y-0 w-px transition-all duration-150 ease-out pointer-events-none z-10"
            style={{
              background: `radial-gradient(200px circle at 100% ${mousePosition.y}%, rgba(56, 189, 248, 0.9), transparent 80%)`,
              opacity: Math.max(0, (mousePosition.x - 75) / 100),
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}
          />

          <div className="p-8 pb-6 flex flex-col items-center text-center">
            {/* Icon Container */}
            <div className="mb-6 relative group/icon">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover/icon:bg-blue-500/30 transition-colors duration-500" />
              <div className="h-16 w-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center relative z-10 shadow-inner group-hover/icon:border-blue-500/40 transition-all duration-300">
                <ShieldAlert className="h-8 w-8 text-blue-400 group-hover/icon:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white text-center mb-2">
                Akses Terbatas
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-zinc-400 text-center">
                Untuk alasan keamanan, login dengan Google hanya bisa digunakan jika akun Kamu sudah ditautkan pada <strong className="text-white font-medium">halaman Account</strong>.
                <br /><br />
                Silakan masuk menggunakan <strong className="text-white font-medium">Email kampus/Username</strong> terlebih dahulu untuk menautkan akun Kamu.
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="px-8 pb-8 sm:justify-center border-t border-white/5 bg-white/[0.02]">
            <ButtonWithIconDemo
              title="Mudah dimengerti, Login Manual"
              description=""
              icon={<span className="h-4 w-4"></span>}
              onClick={() => {
                setShowInterceptModal(false)
                if (onManualLoginFocus) onManualLoginFocus()
              }}
            >
              Mudah dimengerti, Login Manual
            </ButtonWithIconDemo>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
