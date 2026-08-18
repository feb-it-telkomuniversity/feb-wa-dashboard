"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Building2,
  ChevronDown,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";

const ADMIN_ROLES = ["super_admin", "admin"];

// Preset lecture codes untuk keperluan pengembangan/demo
const QUICK_LECTURE_CODES = [
  { code: "IRY", label: "Dr. Irni Yunita (IRY)" },
  { code: "AHP", label: "Dr. Adhi Prasetio (AHP)" },
  { code: "ADT", label: "Aditya Wardhana (ADT)" },
  { code: "AFO", label: "Arlin Ferlina (AFO)" },
  { code: "DDE", label: "Ir. Dodie Tricahyono (DDE)" },
];

function formatAcademicPosition(code) {
  if (!code) return "-";
  const upper = String(code).trim().toUpperCase();
  switch (upper) {
    case "LK":
      return "Lektor Kepala (LK)";
    case "L":
      return "Lektor (L)";
    case "GB":
      return "Guru Besar (GB)";
    case "AA":
      return "Asisten Ahli (AA)";
    case "NJFA":
      return "Non JFA";
    default:
      return upper;
  }
}

export default function AACSBAPIIntegration({
  onImportData,
  isDialog = false,
  open,
  onOpenChange,
}) {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const [lectureCode, setLectureCode] = useState("IRY");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [tridarmaData, setTridarmaData] = useState(null);
  const [expandedMk, setExpandedMk] = useState(null);

  // IssueAuth state — hanya untuk admin jika token perlu diperbarui
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle");

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
      const [resProfile, resTridarma] = await Promise.all([
        api.get(
          `/api/aacsb/dosen/profile?lecture_code=${encodeURIComponent(code)}`,
        ),
        api.get(
          `/api/aacsb/dosen/tridarma?lecture_code=${encodeURIComponent(code)}`,
        ),
      ]);

      const prof = resProfile.data?.data ?? null;
      const tri = resTridarma.data?.data ?? null;

      setProfileData(prof);
      setTridarmaData(tri);

      if (prof || tri) {
        toast.success(`Berhasil memuat data dosen (${code})`);
      } else {
        toast.warning(`Data dosen dengan kode (${code}) tidak ditemukan.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg || "Gagal mengambil data dosen dari server.");
    } finally {
      setLoading(false);
    }
  };

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
          "Autentikasi Gateway berhasil! Token baru telah diperbarui di server.",
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

  const renderContent = () => (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="bg-muted/40 p-4 rounded-xl border border-border/60 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary" />
            Cari Data Dosen (lecture_code)
          </label>
          <span className="text-[11px] text-muted-foreground">
            Contoh:{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-primary font-bold">
              IRY
            </code>
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={lectureCode}
              onChange={(e) => setLectureCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && fetchAACSBData()}
              placeholder="Masukkan kode dosen, contoh: IRY"
              className="pl-9 font-mono font-semibold uppercase bg-background"
            />
          </div>
          <Button
            onClick={() => fetchAACSBData()}
            disabled={loading}
            className="px-5"
          >
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

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Cepat:
            </span>
            {QUICK_LECTURE_CODES.map((item) => (
              <Badge
                key={item.code}
                variant={lectureCode === item.code ? "default" : "outline"}
                className="cursor-pointer text-xs font-mono transition-all hover:bg-primary hover:text-primary-foreground py-0.5 px-2"
                onClick={() => {
                  setLectureCode(item.code);
                  fetchAACSBData(item.code);
                }}
              >
                {item.code}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="hidden sm:inline">Gateway API & DB:</span>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold"
            >
              Ready
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <TabsTrigger
            value="profile"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Profile Dosen
          </TabsTrigger>
          <TabsTrigger
            value="tridarma"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Tridarma Dosen
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="token"
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Key className="h-3.5 w-3.5" />
              Perbarui Token
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Profile Dosen */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          {profileData ? (
            <Card className="border shadow-sm overflow-hidden">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-primary/30">
                      {profileData.lecturercode || lectureCode}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground leading-snug">
                          {profileData.nama ||
                            profileData.name ||
                            `Dosen (${lectureCode})`}
                        </h3>
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px]">
                          {formatAcademicPosition(
                            profileData.academicfuncposition,
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>
                          Kode:{" "}
                          <strong className="font-mono text-foreground">
                            {profileData.lecturercode || lectureCode}
                          </strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          NIP / NIDN:{" "}
                          <strong className="font-mono text-foreground">
                            {profileData["nip / nidn"] ||
                              profileData.nip ||
                              profileData.nidn ||
                              "-"}
                          </strong>
                        </span>
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs self-start sm:self-center px-3 py-1 font-semibold"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Standard 3: Faculty
                  </Badge>
                </div>
              </div>

              {/* Grid Profile Content */}
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Homebase / Program Studi
                    </span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {profileData.homebase || "-"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-blue-500" />
                      Kelompok Keahlian (KK)
                    </span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {profileData["kelompok keahlian"] ||
                        profileData.kelompokKeahlian ||
                        "-"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                      Status Kepegawaian
                    </span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {profileData.employeestatus ||
                        profileData.employeeStatus ||
                        "-"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
                      Pendidikan Terakhir
                    </span>
                    <p className="text-sm font-bold text-foreground leading-snug flex items-center gap-2">
                      <span>
                        {profileData.lastacademictitle ||
                          profileData.lastAcademicTitle ||
                          "-"}
                      </span>
                      {profileData.tahun && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          Lulus {profileData.tahun}
                        </Badge>
                      )}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1 md:col-span-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-violet-500" />
                      Institusi Pendidikan Asal
                    </span>
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {profileData.institutionname ||
                        profileData.institutionName ||
                        "-"}
                    </p>
                  </div>
                </div>

                {/* Raw Inspect Accordion */}
                <details className="text-xs group border border-border/40 rounded-xl p-3 bg-muted/10">
                  <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between">
                    <span>Lihat JSON Respons Lengkap</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <pre className="font-mono bg-muted p-3 rounded-lg mt-2 max-h-48 overflow-auto text-[11px] leading-relaxed">
                    {JSON.stringify(profileData, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Belum ada data Profile Dosen"
              desc='Masukkan kode dosen (contoh: IRY, AHP) lalu klik "Tarik Data"'
              onAction={() => fetchAACSBData()}
              code={lectureCode}
            />
          )}
        </TabsContent>

        {/* Tab 2: Tridarma Dosen */}
        <TabsContent value="tridarma" className="mt-4 space-y-4">
          {tridarmaData ? (
            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Tridarma Dosen ({tridarmaData.lecturercode || lectureCode}
                      )
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      Data Pengajaran, Mata Kuliah, PLO, CLO, dan Bimbingan
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-bold"
                    >
                      Program {tridarmaData.studyprogramtype || "S1/S2"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold"
                    >
                      {tridarmaData.total_bimbingan || 0} Total Bimbingan
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Stat summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Program Studi
                    </p>
                    <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                      {tridarmaData.studyprogramtype || "-"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Total Bimbingan
                    </p>
                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                      {tridarmaData.total_bimbingan || "0"} Mahasiswa
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-1">
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                      Mata Kuliah Diampu
                    </p>
                    <p className="text-lg font-black text-violet-700 dark:text-violet-300">
                      {Array.isArray(tridarmaData.list_mata_kuliah)
                        ? tridarmaData.list_mata_kuliah.length
                        : 0}{" "}
                      Mata Kuliah
                    </p>
                  </div>
                </div>

                {/* List Mata Kuliah */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-primary" />
                    Daftar Mata Kuliah Diampu (
                    {tridarmaData.list_mata_kuliah?.length || 0})
                  </h4>

                  {Array.isArray(tridarmaData.list_mata_kuliah) &&
                  tridarmaData.list_mata_kuliah.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {tridarmaData.list_mata_kuliah.map((mk, index) => {
                        const isExpanded = expandedMk === index;
                        return (
                          <div
                            key={index}
                            className="border border-border/60 rounded-xl p-4 bg-background hover:border-primary/40 transition-all shadow-2xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {mk.subjectcode}
                                  </span>
                                  <h5 className="font-bold text-sm text-foreground">
                                    {mk.subjectname}
                                  </h5>
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span>
                                    Bobot: <strong>{mk.credit} SKS</strong>
                                  </span>
                                  {Array.isArray(mk.classes) &&
                                    mk.classes.length > 0 && (
                                      <>
                                        <span>&bull;</span>
                                        <span>
                                          Kelas:{" "}
                                          <strong>
                                            {mk.classes.join(", ")}
                                          </strong>
                                        </span>
                                      </>
                                    )}
                                </p>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs shrink-0 self-start sm:self-center"
                                onClick={() =>
                                  setExpandedMk(isExpanded ? null : index)
                                }
                              >
                                {isExpanded
                                  ? "Sembunyikan LO"
                                  : "Lihat PLO & CLO"}
                                <ChevronDown
                                  className={`h-3.5 w-3.5 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </Button>
                            </div>

                            {/* Classes pills */}
                            {Array.isArray(mk.classes) &&
                              mk.classes.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {mk.classes.map((cls, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-[10px] font-mono bg-muted"
                                    >
                                      {cls}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                            {/* Expanded PLO / CLO */}
                            {isExpanded && (
                              <div className="pt-3 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* PLO */}
                                <div className="space-y-2 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                                  <h6 className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5" />
                                    PLO (Program Learning Outcomes)
                                  </h6>
                                  {Array.isArray(mk.list_plo) &&
                                  mk.list_plo.length > 0 ? (
                                    <ul className="space-y-1.5">
                                      {mk.list_plo.map((plo, pIdx) => (
                                        <li
                                          key={pIdx}
                                          className="text-muted-foreground text-[11px] leading-relaxed"
                                        >
                                          <strong className="text-foreground">
                                            PLO #{plo.plonumber}:
                                          </strong>{" "}
                                          {plo.ploname}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-muted-foreground text-[11px] italic">
                                      Tidak ada data PLO
                                    </p>
                                  )}
                                </div>

                                {/* CLO */}
                                <div className="space-y-2 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                  <h6 className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    CLO (Course Learning Outcomes)
                                  </h6>
                                  {Array.isArray(mk.list_clo) &&
                                  mk.list_clo.length > 0 ? (
                                    <ul className="space-y-1.5">
                                      {mk.list_clo.map((clo, cIdx) => (
                                        <li
                                          key={cIdx}
                                          className="text-muted-foreground text-[11px] leading-relaxed"
                                        >
                                          <strong className="text-foreground">
                                            CLO #{clo.clonumber}:
                                          </strong>{" "}
                                          {clo.cloname}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-muted-foreground text-[11px] italic">
                                      Tidak ada data CLO
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Tidak ada daftar mata kuliah.
                    </p>
                  )}
                </div>

                <details className="text-xs group border border-border/40 rounded-xl p-3 bg-muted/10">
                  <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between">
                    <span>Lihat JSON Respons Lengkap</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <pre className="font-mono bg-muted p-3 rounded-lg mt-2 max-h-48 overflow-auto text-[11px] leading-relaxed">
                    {JSON.stringify(tridarmaData, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Belum ada data Tridarma Dosen"
              desc='Masukkan kode dosen (contoh: IRY, AHP) lalu klik "Tarik Data"'
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
                  Gunakan jika token Gateway Telkom University sudah expired.
                  Masukkan kredensial SSO Telkom University (bukan password
                  MIRA).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Kredensial SSO digunakan untuk mengenerate token Gateway baru secara otomatis. Server MIRA akan menyimpan dan menggunakan token tersebut secara otomatis di memori tanpa perlu konfigurasi manual.
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
    </div>
  );

  if (isDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Integrasi API Gateway AACSB — Telkom University
            </DialogTitle>
            <DialogDescription>
              Tarik data Profile Dosen dan Tridarma Dosen langsung dari Telkom
              University Gateway & Database.
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
          Tarik data dosen langsung dari Telkom University Gateway & Database
          untuk Akreditasi AACSB
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, desc, onAction, code }) {
  return (
    <div className="text-center py-10 border border-dashed rounded-xl space-y-3 bg-muted/20">
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
