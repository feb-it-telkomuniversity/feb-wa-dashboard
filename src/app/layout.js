import { Geist, Plus_Jakarta_Sans, Inter, Nunito, Raleway } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";
import RoleGuard from "@/components/Auth/RoleGuard";

const fontType = Plus_Jakarta_Sans({
  subsets: ["latin"],
});


export const metadata = {
  title: "MIRA FEB",
  description: "Media Informasi dan Relasi Anda - Menunjukkan kemudahan akses informasi bagi Mahasiswa/Dosen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontType.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark']}
        >
          <main>
            <AuthProvider>
              {children}
            </AuthProvider>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
