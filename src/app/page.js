'use client'

import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import FloatingLines from "@/components/FloatingLines";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter()
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <FloatingLines
            enabledWaves={["middle", "bottom"]}
            lineCount={[5, 3]}
            lineDistance={[8, 6, 4]}
            bendRadius={5.0}
            bendStrength={1.9}
            interactive={true}
            parallax={true}
            mixBlendMode="screen"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030711] via-[#01030b]/30 to-[#030711]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-start text-center text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-white/10 p-1 shadow-lg">
              <Image
                src="/logo-feb.png"
                alt="MIRA Logo"
                width={80}
                height={80}
                className="rounded-xl"
                priority
              />
            </div>
            <div className="text-left">
              <div className="flex flex-col">
                <p className="text-lg font-semibold">
                  MIRA
                </p>
                <p className="text-xs">
                  Media Informasi dan Relasi Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        <GoogleOAuthProvider clientId={clientId}>
          <div className="flex justify-center">
            <div className="w-full">
              <LoginForm />
            </div>
          </div>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}
