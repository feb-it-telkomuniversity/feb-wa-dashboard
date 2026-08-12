"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  Key,
  UserCheck,
  BookOpen,
  Award,
  Globe,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  Database,
  Briefcase,
  GraduationCap,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";

const ADMIN_ROLES = ["super_admin", "admin"];

// Preset lecture codes untuk keperluan pengembangan/demo
const QUICK_LECTURE_CODES = [
  { code: "DNY", label: "DNY" },
  { code: "TYA", label: "TYA" },
  { code: "AHM", label: "AHM" },
  { code: "STR", label: "STR" },
];

export default function AACSBAPIIntegration({
  onImportData,
  isDialog = false,
  open,
  onOpenChange,
}) {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const [lectureCode, setLectureCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [tridarmaData, setTridarmaData] = useState(null);

  // IssueAuth state — hanya untuk admin jika token perlu diperbarui
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle"); // idle | success | error

  const fetchAACSBData = async (codeToFetch = lectureCode) => {
    const code = codeToFetch.trim().toUpperCase();
    if (!code) {
      toast.error("Silakan masukkan Kode Dosen (lecture_code)");
      return;
    }

    setLoading(true);
    setProfileData(null);
    setTridarmaData(null);

    try {
      // Backend MIRA sudah mengelola token Gateway — tidak perlu kirim token dari frontend
      const [resProfile, resTridarma] = await Promise.all([
        api.get(`/api/aacsb/dosen/profile?lecture_code=${encodeURIComponent(code)}`),
        api.get(`/api/aacsb/dosen/tridarma?lecture_code=${encodeURIComponent(code)}`),
      ]);

      setProfileData(resProfile.data?.data ?? null);
      setTridarmaData(resTridarma.data?.data ?? null);

      toast.success(`Data dosen (${code}) berhasil diambil dari Gateway Telkom University`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 503) {
        toast.error("Token Gateway belum dikonfigurasi. Hubungi administrator sistem.");
      } else if (err.response?.status === 403) {
        toast.error("Akses ditolak. Fitur ini hanya untuk role yang berwenang.");
      } else {
        toast.error(msg || "Gagal mengambil data dari Gateway Telkom University.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hanya admin/super_admin yang bisa update token Gateway via issueAuth
  const handleIssueAuth = async (e) => {
    e.preventDefault();
    if (!authUsername || !authPassword) {
      toast.error("Username dan Password Gateway SSO harus diisi");
      return;
    }

    setAuthLoading(true);
    setAuthStatus("idle");
    try {
      const res = await api.post("/api/aacsb/auth", {
        username: authUsername,
        password: authPassword,
      });

      if (res.data.success) {
        setAuthStatus("success");
        setAuthUsername("");
        setAuthPassword("");
        toast.success(
          "Autentikasi Gateway berhasil! Token baru telah diperbarui di server. Perbarui AACSB_GATEWAY_TOKEN di .env jika perlu."
        );
      } else {
        setAuthStatus("error");
        toast.error(res.data.message || "Autentikasi Gateway gagal.");
      }
    } catch (err) {
      setAuthStatus("error");
      const msg = err.response?.data?.message;
      toast.error(msg || "Gagal terhubung ke endpoint autentikasi Gateway.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSyncToDatabase = () => {
    if (!profileData && !tridarmaData) {
      toast.error("Belum ada data dosen yang siap untuk di-sync.");
      return;
    }
    if (onImportData) {
      onImportData({ kodeDosen: lectureCode, profile: profileData, tridarma: tridarmaData });
    }
    toast.success(`Data Dosen (${lectureCode}) berhasil di-sync ke Database Akreditasi AACSB`);
  };

  const renderContent = () => (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="bg-muted/40 p-4 rounded-xl border space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Kode Dosen (lecture_code)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={lectureCode}
              onChange={(e) => setLectureCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && fetchAACSBData()}
              placeholder="Masukkan kode dosen, contoh: DNY"
              className="pl-9 font-mono uppercase bg-background"
            />
          </div>
          <Button onClick={() => fetchAACSBData()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengambil...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tarik Data
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Quick:</span>
          {QUICK_LECTURE_CODES.map((item) => (
            <Badge
              key={item.code}
              variant={lectureCode === item.code ? "default" : "outline"}
              className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                setLectureCode(item.code);
                fetchAACSBData(item.code);
              }}
            >
              {item.label}
            </Badge>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            <span>gateway.telkomuniversity.ac.id</span>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] ml-1"
            >
              Connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs — tab ke-3 hanya muncul untuk admin */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <UserCheck className="h-3.5 w-3.5" />
            Profile Dosen
          </TabsTrigger>
          <TabsTrigger value="tridarma" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <GraduationCap className="h-3.5 w-3.5" />
            Tridarma Dosen
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="token" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Key className="h-3.5 w-3.5" />
              Perbarui Token
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Profile Dosen */}
        <TabsContent value="profile" className="mt-4">
          {profileData ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      {profileData.nama || profileData.name || `Dosen (${lectureCode})`}
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      Kode:{" "}
                      <span className="font-mono font-bold text-foreground">{lectureCode}</span>
                      {(profileData.nip || profileData.nidn) && (
                        <> &middot; NIP/NIDN: {profileData.nip || profileData.nidn}</>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 shrink-0 text-xs">
                    Standard 3: Faculty
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {[
                    { label: "Homebase / Prodi", value: profileData.homebase || profileData.prodi || profileData.department },
                    { label: "Jabatan Fungsional", value: profileData.jabatan || profileData.functional_position },
                    { label: "Status Kepegawaian", value: profileData.status || profileData.employment_status },
                    { label: "Email", value: profileData.email || `${lectureCode.toLowerCase()}@telkomuniversity.ac.id` },
                    { label: "Bidang Keahlian", value: profileData.expertise || profileData.bidang_keahlian },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.label} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-medium text-foreground mt-0.5 truncate">{item.value}</p>
                      </div>
                    ))}
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-1">
                    Lihat raw API response
                  </summary>
                  <pre className="font-mono bg-muted p-2 rounded mt-1 max-h-36 overflow-auto text-[10px]">
                    {JSON.stringify(profileData, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Belum ada data Profile Dosen"
              desc='Masukkan kode dosen lalu klik "Tarik Data"'
              onAction={() => fetchAACSBData()}
              code={lectureCode}
            />
          )}
        </TabsContent>

        {/* Tab 2: Tridarma Dosen */}
        <TabsContent value="tridarma" className="mt-4">
          {tridarmaData ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Tridarma Dosen ({lectureCode})
                </CardTitle>
                <CardDescription>
                  Pendidikan, Penelitian, Pengabdian Masyarakat, dan Pengajaran
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    {
                      icon: GraduationCap,
                      title: "1. Pendidikan & Kualifikasi",
                      value: tridarmaData.pendidikan || tridarmaData.education,
                    },
                    {
                      icon: Briefcase,
                      title: "2. Penelitian & Publikasi",
                      value: tridarmaData.penelitian || tridarmaData.research,
                    },
                    {
                      icon: Layers,
                      title: "3. Pengabdian Masyarakat",
                      value: tridarmaData.pengabdian || tridarmaData.community_service,
                    },
                    {
                      icon: BookOpen,
                      title: "4. Beban Mengajar",
                      value: tridarmaData.pengajaran || tridarmaData.teaching,
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div key={item.title} className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center gap-2 font-semibold text-primary text-xs mb-1">
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          {item.title}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-1">
                    Lihat raw API response
                  </summary>
                  <pre className="font-mono bg-muted p-2 rounded mt-1 max-h-36 overflow-auto text-[10px]">
                    {JSON.stringify(tridarmaData, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Belum ada data Tridarma Dosen"
              desc='Masukkan kode dosen lalu klik "Tarik Data"'
              onAction={() => fetchAACSBData()}
              code={lectureCode}
            />
          )}
        </TabsContent>

        {/* Tab 3: Perbarui Token — hanya admin/super_admin */}
        {isAdmin && (
          <TabsContent value="token" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Perbarui Gateway Bearer Token
                </CardTitle>
                <CardDescription>
                  Gunakan jika token Gateway Telkom University sudah expired. Masukkan
                  kredensial SSO Telkom University (bukan password MIRA).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Kredensial SSO hanya dikirim ke server MIRA dan diteruskan ke Gateway
                    Telkom University. Token yang dihasilkan <strong>tidak disimpan di browser</strong>.
                    Setelah berhasil, salin token dan perbarui variabel{" "}
                    <code className="font-mono bg-muted px-1 py-0.5 rounded">AACSB_GATEWAY_TOKEN</code>{" "}
                    di file <code className="font-mono bg-muted px-1 py-0.5 rounded">.env</code> server.
                  </p>
                </div>

                <form onSubmit={handleIssueAuth} className="space-y-3 max-w-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Username SSO Gateway
                    </label>
                    <Input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="Username SSO Telkom University"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Password SSO Gateway
                    </label>
                    <Input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Password SSO"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button type="submit" size="sm" disabled={authLoading}>
                      {authLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Key className="h-3.5 w-3.5 mr-2" />
                          Generate Token Baru
                        </>
                      )}
                    </Button>
                    {authStatus === "success" && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Berhasil
                      </Badge>
                    )}
                    {authStatus === "error" && (
                      <Badge
                        variant="outline"
                        className="bg-destructive/10 text-destructive border-destructive/30 text-xs flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" /> Gagal
                      </Badge>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Sync footer */}
      {(profileData || tridarmaData) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Sync Data Dosen ({lectureCode}) ke AACSB Database
              </p>
              <p className="text-xs text-muted-foreground">
                Impor data profile & tridarma ke tabel Akreditasi AACSB.
              </p>
            </div>
          </div>
          <Button onClick={handleSyncToDatabase} size="sm" className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Sync ke Database
          </Button>
        </div>
      )}
    </div>
  );

  if (isDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Integrasi API Gateway AACSB — Telkom University
            </DialogTitle>
            <DialogDescription>
              Tarik data Profile Dosen dan Tridarma Dosen langsung dari Gateway Telkom University.
            </DialogDescription>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Integrasi API Gateway AACSB
        </CardTitle>
        <CardDescription>
          Tarik data dosen langsung dari Telkom University Gateway untuk keperluan Akreditasi AACSB
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

// ─── Helper component ───────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, desc, onAction, code }) {
  return (
    <div className="text-center py-10 border border-dashed rounded-xl space-y-3">
      <Icon className="h-9 w-9 text-muted-foreground mx-auto" />
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {code && (
        <Button size="sm" variant="outline" onClick={onAction}>
          Tarik Data ({code})
        </Button>
      )}
    </div>
  );
}
