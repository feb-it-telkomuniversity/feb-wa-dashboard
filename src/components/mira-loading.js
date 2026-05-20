"use client"

import { useEffect, useState } from "react"

export function MiraLoading({ message = "Memasuki aplikasi MIRA...", className = "" }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [typedText, setTypedText] = useState("")
    const [hasMounted, setHasMounted] = useState(false)

    const steps = [
        "Memverifikasi sesi Anda",
        "Memeriksa izin pengguna",
        "Memvalidasi tingkat akses",
        "Menyelesaikan pemeriksaan keamanan",
    ]

    useEffect(() => {
        setHasMounted(true)
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length)
        }, 1500)

        return () => clearInterval(stepInterval)
    }, [])

    useEffect(() => {
        const text = steps[currentStep]
        setTypedText("")

        let i = 0
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                setTypedText(text.slice(0, i + 1))
                i++
            } else {
                clearInterval(typeInterval)
            }
        }, 50)

        return () => clearInterval(typeInterval)
    }, [currentStep])

    return (
        <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-8 ${className}`}>
            <style jsx>{`
                @keyframes sparkle {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.5); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                @keyframes documentWrite {
                    0%, 100% { opacity: 0.5; width: 30%; }
                    50% { opacity: 1; width: 100%; }
                }
                @keyframes aiPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
            `}</style>

            {/* Main Animation Container */}
            <div className="relative">
                {/* Floating Sparkles - Adjusted to Primary (Tel-U Red) */}
                <div className="absolute -top-4 -left-4 w-3 h-3 bg-primary/40 rounded-full animate-[sparkle_2s_ease-in-out_infinite]" />
                <div className="absolute -top-2 -right-6 w-2 h-2 bg-primary/20 rounded-full animate-[sparkle_2s_ease-in-out_infinite_0.5s]" />
                <div className="absolute -bottom-4 -right-2 w-3 h-3 bg-primary rounded-full animate-[sparkle_2s_ease-in-out_infinite_1s]" />
                <div className="absolute -bottom-2 -left-6 w-2 h-2 bg-primary/60 rounded-full animate-[sparkle_2s_ease-in-out_infinite_1.5s]" />

                {/* Document Container */}
                <div className="relative bg-card border-2 border-primary/20 rounded-lg shadow-xl p-6 w-80 h-96 animate-[float_3s_ease-in-out_infinite]">
                    {/* Document Header */}
                    <div className="space-y-3 mb-6">
                        <div className="h-4 bg-gradient-to-r from-primary to-primary/40 rounded animate-[documentWrite_3s_ease-in-out_infinite]" />
                        <div className="h-3 bg-muted rounded animate-[documentWrite_3s_ease-in-out_infinite_0.5s] w-3/4" />
                        <div className="h-3 bg-muted rounded animate-[documentWrite_3s_ease-in-out_infinite_1s] w-1/2" />
                    </div>

                    {/* Document Lines */}
                    <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 bg-primary/10 rounded animate-[documentWrite_3s_ease-in-out_infinite]`}
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    width: i % 3 === 0 ? "100%" : i % 2 === 0 ? "80%" : "90%",
                                }}
                            />
                        ))}
                    </div>

                    {/* AI Brain Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center animate-[aiPulse_2s_ease-in-out_infinite] border border-primary/20 shadow-inner">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="w-80 space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Progress Akses</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden shadow-inner border border-border">
                    <div
                        className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-foreground tracking-tight">{message}</h3>
                <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 inline-block min-w-[280px]">
                    <p className="text-primary font-mono text-sm">
                        <span className="opacity-50 mr-2">&gt;</span>
                        {typedText}
                        <span className="animate-pulse bg-primary w-2 h-4 inline-block ml-1 align-middle" />
                    </p>
                </div>
            </div>

            {/* Floating Elements - Fixed Hydration Mismatch */}
            {hasMounted && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-[float_4s_ease-in-out_infinite]"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.8}s`,
                                animationDuration: `${4 + Math.random() * 2}s`,
                                opacity: 0.4 + Math.random() * 0.5
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
