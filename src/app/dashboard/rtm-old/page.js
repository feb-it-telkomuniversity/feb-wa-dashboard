"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Calendar } from "lucide-react";

// Data Evidence Audit 2025 - Hasil Ekstraksi Real
const initialEvidenceData = [
    // --- JANUARI ---
    {
        id: "jan-1", bulan: "Januari", tanggal: "03 Januari 2025",
        topik: "Persiapan Pelaksanaan Visitasi Akreditasi Lamemba S2 Akuntansi",
        pembahasan: [
            "Perlu koordinasi intensif dengan direktorat pendukung untuk memastikan kelancaran visitasi.",
            "Dibutuhkan media komunikasi terpusat untuk mengoordinasikan dokumen dan persiapan teknis.",
            "Perlu penyampaian resmi (NDE) terkait pelaksanaan visitasi kepada pihak internal dan pimpinan universitas.",
            "Risiko gangguan teknis (bandwidth/internet) saat visitasi berlangsung.",
            "Kebutuhan keterlibatan pimpinan universitas dalam pembukaan acara visitasi.",
            "Inti isu: kesiapan administratif, teknis, dan koordinatif agar visitasi berjalan tanpa hambatan."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBGvSP_LEMyTYJoeA0R3zdlAbk29IKQk4afLnpdX7bLItk?e=AOfcx0"
    },
    {
        id: "jan-2", bulan: "Januari", tanggal: "03 Januari 2025",
        topik: "Plotting Dosen (Penetapan Pengampu & Pembimbing)",
        pembahasan: [
            "Perlunya pemetaan dosen berdasarkan status (dosen tetap, tugas tambahan, izin belajar, kontrak).",
            "Beban mengajar harus sesuai regulasi Kemendikbudristek No. 12/E/KPT/2021.",
            "Harus ada keseimbangan beban SKS dan jumlah kelas agar adil dan sesuai kompetensi.",
            "Inti isu: distribusi beban kerja dosen agar sesuai regulasi dan prinsip keadilan akademik."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBGvSP_LEMyTYJoeA0R3zdlAbk29IKQk4afLnpdX7bLItk?e=AOfcx0"
    },
    {
        id: "jan-3", bulan: "Januari", tanggal: "03 Januari 2025",
        topik: "RKM/RKA TW4 Berdasarkan Anggaran 2024",
        pembahasan: [
            "Fokus anggaran besar pada visiting professor.",
            "Optimalisasi networking untuk penguatan pendidikan dan penelitian.",
            "Evaluasi penyerapan anggaran TW4.",
            "Diskusi interaktif untuk mengidentifikasi area perbaikan pada prodi terakreditasi.",
            "Pengembangan SDM melalui pelatihan dan sertifikasi internasional (TPA & dosen).",
            "Inti isu: efektivitas penggunaan anggaran TW4 untuk peningkatan mutu akademik dan reputasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBGvSP_LEMyTYJoeA0R3zdlAbk29IKQk4afLnpdX7bLItk?e=AOfcx0"
    },
    {
        id: "jan-4", bulan: "Januari", tanggal: "03 Januari 2025",
        topik: "Usulan Pedoman Publikasi (Pengganti Sidang S1 & S2)",
        pembahasan: [
            "Update pedoman publikasi sebagai pengganti sidang.",
            "Perlunya SK Dekan untuk penguatan regulasi.",
            "Perlu sinkronisasi dengan Direktorat Akademik dan Warek 1.",
            "Inti isu: penyesuaian kebijakan akademik terkait mekanisme kelulusan berbasis publikasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBGvSP_LEMyTYJoeA0R3zdlAbk29IKQk4afLnpdX7bLItk?e=AOfcx0"
    },
    {
        id: "jan-5", bulan: "Januari", tanggal: "03 Januari 2025",
        topik: "Mendorong Publikasi Internasional",
        pembahasan: [
            "Target peningkatan publikasi terindeks Scopus.",
            "Perlu monitoring jurnal terindeks.",
            "Perlunya pelatihan penulisan artikel ilmiah (nasional & internasional).",
            "Dorongan penyelenggaraan conference.",
            "Integrasi data karya ilmiah melalui PDDikti, Sister, dan Kedaireka.",
            "Perlu peningkatan capaian IKU melalui riset and pengabdian masyarakat berekognisi internasional."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBGvSP_LEMyTYJoeA0R3zdlAbk29IKQk4afLnpdX7bLItk?e=AOfcx0"
    },

    // --- FEBRUARI ---
    {
        id: "feb-1", bulan: "Februari", tanggal: "19 Februari 2025",
        topik: "Aturan Publikasi & Dosen Pembimbing sebagai Penulis Pertama",
        pembahasan: [
            "Perlunya standar aturan publikasi yang menegaskan posisi dosen pembimbing sebagai penulis pertama.",
            "Penegasan bahwa publikasi yang diakui bukan berasal dari skripsi/tesis/disertasi mahasiswa.",
            "Diperkuat dengan penerbitan SK Panduan Publikasi Pengganti Sidang."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAyCMGIGBeJSKDNYiK_o9XQAUq62rdvyjXNl5teyimsKSM?e=rjZ6wS"
    },
    {
        id: "feb-2", bulan: "Februari", tanggal: "19 Februari 2025",
        topik: "Monitoring dan Evaluasi Kerjasama Abdimas",
        pembahasan: [
            "Perlu monitoring dan evaluasi berkala terhadap MoA and implementasinya (IA).",
            "Termasuk pengukuran kepuasan mitra serta peningkatan mutu kerjasama berkelanjutan."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAyCMGIGBeJSKDNYiK_o9XQAUq62rdvyjXNl5teyimsKSM?e=rjZ6wS"
    },
    {
        id: "feb-3", bulan: "Februari", tanggal: "19 Februari 2025",
        topik: "Inisiasi Kerjasama",
        pembahasan: [
            "Pengembangan kolaborasi di bidang pendidikan, penelitian, pengabdian, dan pengembangan SDM melalui seminar, workshop, pertukaran pengetahuan.",
            "Perluasan jaringan yang berdampak pada mutu prodi/fakultas."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAyCMGIGBeJSKDNYiK_o9XQAUq62rdvyjXNl5teyimsKSM?e=rjZ6wS"
    },
    {
        id: "feb-4", bulan: "Februari", tanggal: "19 Februari 2025",
        topik: "Kontrak Manajemen",
        pembahasan: [
            "Integrasi capaian IKU (termasuk IKU 7).",
            "Peningkatan penelitian TRL ≥ 4.",
            "Peningkatan dosen berkegiatan tridharma di luar kampus.",
            "Peningkatan jumlah dosen bersertifikasi profesi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAyCMGIGBeJSKDNYiK_o9XQAUq62rdvyjXNl5teyimsKSM?e=rjZ6wS"
    },

    // --- APRIL ---
    {
        id: "apr-1", bulan: "April", tanggal: "16 April 2025",
        topik: "Kontrak Manajemen (KM) FEB",
        pembahasan: [
            "Perlunya kelengkapan data and evidence guna pencapaian target KM TW 1–2025, termasuk koordinasi dengan Kaprodi, Sekprodi, and unit pendukung.",
            "Mencakup capaian CSI 2024, implementasi IKU 7 (kelas kolaboratif), penelitian TRL ≥ 4.",
            "Persentase dosen berkegiatan tridharma di luar kampus, serta dosen bersertifikasi profesi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQChJHEsnjUDT4gEeGGRwpR9AZH3qZ0STw8O-Otui6PWS0Q?e=2Myus7"
    },
    {
        id: "apr-2", bulan: "April", tanggal: "16 April 2025",
        topik: "Persiapan Surveillance ISO",
        pembahasan: [
            "Review dan update SOP, IK, serta dokumen mutu untuk memastikan kesesuaian dengan praktik aktual.",
            "Pengendalian versi dokumen terbaru (evidence-based)."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQChJHEsnjUDT4gEeGGRwpR9AZH3qZ0STw8O-Otui6PWS0Q?e=2Myus7"
    },
    {
        id: "apr-3", bulan: "April", tanggal: "16 April 2025",
        topik: "Ruang Kelas dan Kapasitas",
        pembahasan: [
            "Perlunya evaluasi kapasitas ruangan and kuota mahasiswa guna menjamin kenyamanan proses belajar mengajar dan pelaksanaan ujian.",
            "Pengecekan fasilitas and ketersediaan dosen wali/pengajar."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQChJHEsnjUDT4gEeGGRwpR9AZH3qZ0STw8O-Otui6PWS0Q?e=2Myus7"
    },

    // --- MEI ---
    {
        id: "mei-1", bulan: "Mei", tanggal: "07 Mei 2025",
        topik: "Serah Terima Jabatan Kaprodi",
        pembahasan: [
            "Apresiasi terhadap kepemimpinan Kaprodi lama atas capaian akreditasi dan pengembangan prodi.",
            "Harapan terhadap Kaprodi baru untuk melanjutkan peningkatan kualitas akademik, inovasi, dan penguatan relasi dengan mahasiswa serta alumni."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQB2M-18d0eySYOvHoEE-hK5AcDbTVeICLViC09f56xhnsQ?e=KowFwq"
    },
    {
        id: "mei-2", bulan: "Mei", tanggal: "07 Mei 2025",
        topik: "Pelepasan Haji Dosen FEB",
        pembahasan: [
            "Bentuk dukungan moral dan apresiasi kepada dua dosen yang menunaikan ibadah haji.",
            "Representasi perhatian institusi terhadap civitas akademika."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQB2M-18d0eySYOvHoEE-hK5AcDbTVeICLViC09f56xhnsQ?e=KowFwq"
    },
    {
        id: "mei-3", bulan: "Mei", tanggal: "07 Mei 2025",
        topik: "Kontrak Manajemen (KM) TW 2 – 2025",
        pembahasan: [
            "Kelengkapan data dan evidence pencapaian KM TW 2 meliputi: kepuasan mahasiswa (EDOM), publikasi Scopus/WoS, hibah eksternal penelitian/abdimas.",
            "Peningkatan sitasi, kolaborasi internasional, prestasi mahasiswa, kesiapan inbound mobility.",
            "Standar online learning, penelitian TRL ≥ 4, keterlibatan dosen di entrepreneurship (BTP), serta peningkatan kompetensi pegawai."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQB2M-18d0eySYOvHoEE-hK5AcDbTVeICLViC09f56xhnsQ?e=KowFwq"
    },
    {
        id: "mei-4", bulan: "Mei", tanggal: "21 Mei 2025",
        topik: "Kurikulum dengan Reading, Writing, dan Storytelling",
        pembahasan: [
            "Perlunya metode pembelajaran yang menarik dan kreatif agar mahasiswa lebih aktif.",
            "Penguatan kemampuan mendengar (istima’), memahami dialog/teks, serta kemampuan menyampaikan pesan secara lisan, tulisan, dan visual."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCII5SWaLWtQ5vzEsmyquKdAaBvGZ8jFaNx83VNUEmnwdk?e=BoPWes"
    },
    {
        id: "mei-5", bulan: "Mei", tanggal: "21 Mei 2025",
        topik: "THE WUR 2025",
        pembahasan: [
            "Posisi Telkom University dalam 20 besar Perguruan Tinggi terbaik di Indonesia.",
            "Dorongan untuk meningkatkan jumlah profesor guna memperkuat peringkat THE WUR pada periode berikutnya."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCII5SWaLWtQ5vzEsmyquKdAaBvGZ8jFaNx83VNUEmnwdk?e=BoPWes"
    },
    {
        id: "mei-6", bulan: "Mei", tanggal: "21 Mei 2025",
        topik: "QS WUR Sustainability",
        pembahasan: [
            "Posisi Telkom University dalam 34 besar Perguruan Tinggi terbaik di Indonesia.",
            "Memerlukan kelengkapan data and evidence untuk mendukung pencapaian target Kontrak Manajemen."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCII5SWaLWtQ5vzEsmyquKdAaBvGZ8jFaNx83VNUEmnwdk?e=BoPWes"
    },
    {
        id: "mei-7", bulan: "Mei", tanggal: "21 Mei 2025",
        topik: "Regulasi Akreditasi Internasional (AMBA, AACSB, IACBE)",
        pembahasan: [
            "Proses tahapan akreditasi internasional FEB untuk memastikan pemenuhan standar mutu global melalui asesmen independen."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCII5SWaLWtQ5vzEsmyquKdAaBvGZ8jFaNx83VNUEmnwdk?e=BoPWes"
    },
    {
        id: "mei-8", bulan: "Mei", tanggal: "21 Mei 2025",
        topik: "MoA dengan PT. HGI",
        pembahasan: [
            "Identifikasi kebutuhan fakultas/prodi and penyelarasan visi sebagai dasar implementasi kerjasama yang saling menguntungkan."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCII5SWaLWtQ5vzEsmyquKdAaBvGZ8jFaNx83VNUEmnwdk?e=BoPWes"
    },

    // --- JULI ---
    // 2 Juli
    {
        id: "jul-1", bulan: "Juli", tanggal: "02 Juli 2025",
        topik: "Capaian Kontrak Manajemen (KM) TW 2 – 2025",
        pembahasan: [
            "Rekap dan evaluasi capaian KM per indikator, termasuk publikasi terindeks Scopus/WoS.",
            "Guna memastikan ketercapaian target TW 2 serta kelengkapan data pendukung."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAFZr3-EghzQZftVfkZnwu7AUphXfmRHyeQMcaKt_U892g?e=o8yb6g"
    },
    {
        id: "jul-2", bulan: "Juli", tanggal: "02 Juli 2025",
        topik: "Laporan WD 1 dan WD 2",
        pembahasan: [
            "Penyampaian laporan bidang akademik (WD 1) serta non-akademik/keuangan/SDM (WD 2).",
            "Termasuk identifikasi isu strategis dan risiko operasional fakultas."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAFZr3-EghzQZftVfkZnwu7AUphXfmRHyeQMcaKt_U892g?e=o8yb6g"
    },
    {
        id: "jul-3", bulan: "Juli", tanggal: "02 Juli 2025",
        topik: "Laporan Prodi dan Kelompok Keahlian (KK)",
        pembahasan: [
            "Penyampaian dan evaluasi capaian kinerja prodi dan KK dalam aspek akademik, riset, pengabdian, dan kerjasama.",
            "Untuk mengukur ketercapaian target masing-masing unit."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAFZr3-EghzQZftVfkZnwu7AUphXfmRHyeQMcaKt_U892g?e=o8yb6g"
    },
    // 9 Juli
    {
        id: "jul-4", bulan: "Juli", tanggal: "09 Juli 2025",
        topik: "Capaian Kontrak Manajemen (KM) TW 2 – 2025",
        pembahasan: [
            "Rekap dan evaluasi capaian KM per indikator, termasuk publikasi terindeks Scopus/WoS.",
            "Guna memastikan ketercapaian target TW 2 serta kelengkapan data pendukung."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC4AaImtGSnRaGI-hD1atksAQHdsRW5PVQEjPyxeC5oow8?e=6ZM6f4"
    },
    {
        id: "jul-5", bulan: "Juli", tanggal: "09 Juli 2025",
        topik: "Laporan WD 1 dan WD 2",
        pembahasan: [
            "Penyampaian laporan bidang akademik (WD 1) serta non-akademik/keuangan/SDM (WD 2).",
            "Termasuk identifikasi isu strategis dan risiko operasional fakultas."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC4AaImtGSnRaGI-hD1atksAQHdsRW5PVQEjPyxeC5oow8?e=6ZM6f4"
    },
    {
        id: "jul-6", bulan: "Juli", tanggal: "09 Juli 2025",
        topik: "Laporan Prodi dan Kelompok Keahlian (KK)",
        pembahasan: [
            "Penyampaian dan evaluasi capaian kinerja prodi dan KK dalam aspek akademik, riset, pengabdian, dan kerjasama.",
            "Untuk mengukur ketercapaian target masing-masing unit."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC4AaImtGSnRaGI-hD1atksAQHdsRW5PVQEjPyxeC5oow8?e=6ZM6f4"
    },
    // 30 Juli
    {
        id: "jul-7", bulan: "Juli", tanggal: "30 Juli 2025",
        topik: "Hasil Rapat Pimpinan",
        pembahasan: [
            "Penyampaian arahan strategis pimpinan universitas/fakultas, penyesuaian target IKU, anggaran dan prioritas program.",
            "Kebutuhan penyusunan matriks tindak lanjut yang sinkron dengan Renstra dan RKAT."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQANXmm0xXzST6C0oVGYD0U_Afh8cLXJLu05qiO-f1vSkUg?e=ejAQN4"
    },
    {
        id: "jul-8", bulan: "Juli", tanggal: "30 Juli 2025",
        topik: "Plotting Dosen",
        pembahasan: [
            "Distribusi beban mengajar (BKD) belum merata, kesesuaian kompetensi dosen dengan mata kuliah, potensi overload/underload.",
            "Kebutuhan pemetaan kompetensi dan penyesuaian SK mengajar sesuai regulasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQANXmm0xXzST6C0oVGYD0U_Afh8cLXJLu05qiO-f1vSkUg?e=ejAQN4"
    },
    {
        id: "jul-9", bulan: "Juli", tanggal: "30 Juli 2025",
        topik: "HMS, LTW dan Cleansing Data Akademik",
        pembahasan: [
            "Ketidaksesuaian dan duplikasi data akademik yang tidak sinkron dengan sistem pelaporan (PDDIKTI/akreditasi).",
            "Perlu audit, verifikasi, dan cleansing data serta penetapan SOP validasi berkala."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQANXmm0xXzST6C0oVGYD0U_Afh8cLXJLu05qiO-f1vSkUg?e=ejAQN4"
    },
    {
        id: "jul-10", bulan: "Juli", tanggal: "30 Juli 2025",
        topik: "Tugas Akhir S2 Skema “By Course” (Studi Kasus & Project)",
        pembahasan: [
            "Belum adanya pedoman rinci terkait alternatif tesis by course, termasuk standar kualitas, CPL, mekanisme pembimbingan dan pengujian.",
            "Perlu penyusunan pedoman akademik dan rubrik penilaian yang terstandar."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQANXmm0xXzST6C0oVGYD0U_Afh8cLXJLu05qiO-f1vSkUg?e=ejAQN4"
    },

    // --- AGUSTUS ---
    // 13 Agustus
    {
        id: "agu-1", bulan: "Agustus", tanggal: "13 Agustus 2025",
        topik: "Pengampuan Fakultas & Materi",
        pembahasan: [
            "Ketidaksesuaian kompetensi dosen dengan mata kuliah, perlunya standarisasi RPS dan materi antar kelas.",
            "Pembaruan konten berbasis OBE dan kebutuhan industri, serta integrasi materi bilingual/internasional."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC5NcwaAdZIRpoeRzCFmMfQASoYRelKsR3ZBc-UAxIr0vs?e=jrgwMV"
    },
    {
        id: "agu-2", bulan: "Agustus", tanggal: "13 Agustus 2025",
        topik: "Sosialisasi Inkubasi BTP",
        pembahasan: [
            "Rendahnya awareness mahasiswa terhadap program inkubasi, belum jelasnya mekanisme seleksi tenant.",
            "Perlunya roadmap, mentor, dan sistem monitoring yang terstruktur."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC5NcwaAdZIRpoeRzCFmMfQASoYRelKsR3ZBc-UAxIr0vs?e=jrgwMV"
    },
    {
        id: "agu-3", bulan: "Agustus", tanggal: "13 Agustus 2025",
        topik: "Optimalisasi Monitoring Mahasiswa (IPS <2, EPRT, HMS, TA, Cumlaude & Summa Employability)",
        pembahasan: [
            "Belum adanya sistem early warning terintegrasi untuk mahasiswa berisiko.",
            "Kendala progres akademik (IPS, EPRT, TA), serta perlunya revisi kriteria cumlaude dan perumusan indikator “summa employability”."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC5NcwaAdZIRpoeRzCFmMfQASoYRelKsR3ZBc-UAxIr0vs?e=jrgwMV"
    },
    {
        id: "agu-4", bulan: "Agustus", tanggal: "13 Agustus 2025",
        topik: "Rencana Kedatangan Tamu UMPSA (General Lecture, FGD, MoA Meeting)",
        pembahasan: [
            "Perlunya penentuan tema strategis, finalisasi agenda, penunjukan PIC.",
            "Dokumentasi dan tindak lanjut kerja sama agar output akademik dan kolaborasi terstruktur."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC5NcwaAdZIRpoeRzCFmMfQASoYRelKsR3ZBc-UAxIr0vs?e=jrgwMV"
    },
    {
        id: "agu-5", bulan: "Agustus", tanggal: "13 Agustus 2025",
        topik: "Kepuasan Mahasiswa (EDOM)",
        pembahasan: [
            "Evaluasi kinerja dosen melalui EDOM, tindak lanjut masukan mahasiswa.",
            "Penanganan komplain melalui mekanisme respon cepat guna meningkatkan kualitas layanan akademik."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQC5NcwaAdZIRpoeRzCFmMfQASoYRelKsR3ZBc-UAxIr0vs?e=jrgwMV"
    },
    // 27 Agustus
    {
        id: "agu-6", bulan: "Agustus", tanggal: "27 Agustus 2025",
        topik: "Program Internasionalisasi Prodi",
        pembahasan: [
            "Status MoU/MoA belum seluruhnya aktif, kesiapan kurikulum untuk Double Degree/mobility.",
            "Keterbatasan partisipasi outbound and target inbound belum optimal.",
            "Perlu evaluasi mitra and penyesuaian kurikulum serta SOP mobility."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCGaLi7XIsPS5exMEXd4seoAbBTO0Pjx8i-G2GLguD7u3Q?e=kYEWes"
    },
    {
        id: "agu-7", bulan: "Agustus", tanggal: "27 Agustus 2025",
        topik: "Serah Terima Senat Fakultas Lama dan Baru",
        pembahasan: [
            "Transisi kepengurusan and kewenangan Senat memerlukan dokumentasi serah terima.",
            "Penyesuaian tata tertib, serta penetapan agenda kerja periode baru agar keberlanjutan program tetap terjaga."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCGaLi7XIsPS5exMEXd4seoAbBTO0Pjx8i-G2GLguD7u3Q?e=kYEWes"
    },
    {
        id: "agu-8", bulan: "Agustus", tanggal: "27 Agustus 2025",
        topik: "Penyampaian Materi Wadek 1 (Bidang Akademik)",
        pembahasan: [
            "Update kebijakan akademik (kurikulum, OBE, MBKM), evaluasi mutu pembelajaran.",
            "Isu beban mengajar, serta kebutuhan action plan akademik untuk kesiapan akreditasi and penjaminan mutu."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCGaLi7XIsPS5exMEXd4seoAbBTO0Pjx8i-G2GLguD7u3Q?e=kYEWes"
    },
    {
        id: "agu-9", bulan: "Agustus", tanggal: "27 Agustus 2025",
        topik: "Draft Penyusunan Tugas Akhir Studi Kasus/Proyek",
        pembahasan: [
            "Alternatif TA non-tesis memerlukan regulasi yang jelas terkait standar akademik, bobot SKS.",
            "Mekanisme pembimbingan and penilaian, serta pengesahan Senat."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCGaLi7XIsPS5exMEXd4seoAbBTO0Pjx8i-G2GLguD7u3Q?e=kYEWes"
    },
    {
        id: "agu-10", bulan: "Agustus", tanggal: "27 Agustus 2025",
        topik: "Kontrak Manajemen (KM) TW 3",
        pembahasan: [
            "Pencapaian indikator KM meliputi publikasi Scopus/WoS, program Dual/Joint Degree, penelitian TRL ≥ 4.",
            "Keterlibatan mahasiswa dalam riset CoE and entrepreneurship BTP, peningkatan kelulusan tepat waktu.",
            "Penurunan DO/undur diri, kelas kolaboratif (IKU 7), serta peningkatan kompetensi pegawai."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCGaLi7XIsPS5exMEXd4seoAbBTO0Pjx8i-G2GLguD7u3Q?e=kYEWes"
    },

    // --- SEPTEMBER ---
    // 17 September
    {
        id: "sep-1", bulan: "September", tanggal: "17 September 2025",
        topik: "Serah Terima Jabatan Sekretaris Prodi S1 Akuntansi",
        pembahasan: [
            "Transisi tugas and tanggung jawab struktural memerlukan berita acara serah terima.",
            "Inventarisasi pekerjaan berjalan, serta sinkronisasi target kinerja agar keberlanjutan administrasi and akreditasi tetap terjaga."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCyzLOKeHxjQJ_ufGsr9GddATCerd970HHqweA9CK529vY?e=JtZf9Z"
    },
    {
        id: "sep-2", bulan: "September", tanggal: "17 September 2025",
        topik: "Hasil Review AACSB (Prof. Tony)",
        pembahasan: [
            "Evaluasi kesesuaian standar AACSB (governance, faculty qualification, AoL, impact) menunjukkan adanya gap pada faculty sufficiency.",
            "Dokumentasi AoL, serta bukti impact yang belum terdokumentasi sistematis sehingga perlu gap analysis and roadmap percepatan."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCyzLOKeHxjQJ_ufGsr9GddATCerd970HHqweA9CK529vY?e=JtZf9Z"
    },
    {
        id: "sep-3", bulan: "September", tanggal: "17 September 2025",
        topik: "Ketercapaian Renstra",
        pembahasan: [
            "Realisasi program belum sepenuhnya sesuai target tahunan, beberapa indikator belum terukur kuantitatif.",
            "Perlu realignment dengan dinamika kebijakan universitas melalui evaluasi and strategi akselerasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCyzLOKeHxjQJ_ufGsr9GddATCerd970HHqweA9CK529vY?e=JtZf9Z"
    },
    {
        id: "sep-4", bulan: "September", tanggal: "17 September 2025",
        topik: "Ketercapaian KM TW 3",
        pembahasan: [
            "Beberapa indikator KM belum mencapai target TW 3 sehingga diperlukan rekap capaian.",
            "Analisis akar masalah, and penyusunan action plan percepatan menuju TW 4."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCyzLOKeHxjQJ_ufGsr9GddATCerd970HHqweA9CK529vY?e=JtZf9Z"
    },
    // 24 September
    {
        id: "sep-5", bulan: "September", tanggal: "24 September 2025",
        topik: "Advisory Board FEB",
        pembahasan: [
            "Perlu penguatan peran Advisory Board dalam tata kelola strategis, termasuk optimalisasi komposisi anggota.",
            "Kejelasan mekanisme kerja, serta integrasi rekomendasi Advisory Board ke dalam Renstra and proses akreditasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAAcRJTnUDbT5U18MQa2p_5AdiJDiWhROumWThpEsFcpXM?e=tWJdVm"
    },
    {
        id: "sep-6", bulan: "September", tanggal: "24 September 2025",
        topik: "Laporan Hearing Dekanat (Tertutup)",
        pembahasan: [
            "Adanya isu internal yang bersifat sensitif (SDM, tata kelola, akademik/mahasiswa) memerlukan klarifikasi.",
            "Analisis risiko institusional, serta penetapan langkah korektif and preventif yang terkontrol."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAAcRJTnUDbT5U18MQa2p_5AdiJDiWhROumWThpEsFcpXM?e=tWJdVm"
    },
    {
        id: "sep-7", bulan: "September", tanggal: "24 September 2025",
        topik: "Magang Kelas Internasional",
        pembahasan: [
            "Ketersediaan mitra industri global, kesesuaian durasi and rekognisi SKS, kesiapan bahasa mahasiswa.",
            "Perlunya pedoman and sistem monitoring pelaksanaan magang internasional."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAAcRJTnUDbT5U18MQa2p_5AdiJDiWhROumWThpEsFcpXM?e=tWJdVm"
    },
    {
        id: "sep-8", bulan: "September", tanggal: "24 September 2025",
        topik: "Penetapan Status Mahasiswa Tidak Registrasi",
        pembahasan: [
            "Data mahasiswa tidak registrasi belum tervalidasi final and berpotensi berdampak pada pelaporan PDDIKTI and akreditasi.",
            "Verifikasi akhir, penetapan timeline resmi, serta sinkronisasi sistem."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAAcRJTnUDbT5U18MQa2p_5AdiJDiWhROumWThpEsFcpXM?e=tWJdVm"
    },

    // --- OKTOBER ---
    // 8 Oktober
    {
        id: "okt-1", bulan: "Oktober", tanggal: "08 Oktober 2025",
        topik: "Hasil Rapim",
        pembahasan: [
            "Arahan strategis pimpinan universitas terkait akademik, SDM, keuangan, reputasi institusi.",
            "Penyesuaian target IKU/IKF fakultas yang perlu ditindaklanjuti melalui sinkronisasi Renstra and RKAT."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDYHdT_4T6STrzzHarR8SCTAUU7F5t4x8k3LjugAM3XhKo?e=cem8Kp"
    },
    {
        id: "okt-2", bulan: "Oktober", tanggal: "08 Oktober 2025",
        topik: "Masukan untuk Pedoman Akademik 2025",
        pembahasan: [
            "Kebutuhan pembaruan regulasi akademik (MBKM, OBE, TA non-tesis, kelas internasional).",
            "Standarisasi evaluasi and masa studi, serta integrasi digital learning and AI sesuai regulasi terbaru."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDYHdT_4T6STrzzHarR8SCTAUU7F5t4x8k3LjugAM3XhKo?e=cem8Kp"
    },
    {
        id: "okt-3", bulan: "Oktober", tanggal: "08 Oktober 2025",
        topik: "Pengaplikasian AI di FEB di Tiap Prodi",
        pembahasan: [
            "Pemanfaatan AI dalam pembelajaran, riset, and administrasi belum terstruktur.",
            "Isu etika akademik and literasi AI, sehingga perlu guideline resmi and program penguatan kompetensi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDYHdT_4T6STrzzHarR8SCTAUU7F5t4x8k3LjugAM3XhKo?e=cem8Kp"
    },
    {
        id: "okt-4", bulan: "Oktober", tanggal: "08 Oktober 2025",
        topik: "Kontrak Manajemen (KM) TW 4",
        pembahasan: [
            "Pencapaian indikator KM meliputi kepuasan mahasiswa (EDOM), pengalaman luar kampus, publikasi and sitasi internasional.",
            "Hibah eksternal, kolaborasi internasional, desa binaan, prestasi mahasiswa, mobilitas internasional.",
            "Peningkatan kualifikasi dosen (S3 & JFA), online learning, learning factory, sertifikasi mahasiswa, startup inovasi, HKI industri."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDYHdT_4T6STrzzHarR8SCTAUU7F5t4x8k3LjugAM3XhKo?e=cem8Kp"
    },
    // 15 Oktober
    {
        id: "okt-5", bulan: "Oktober", tanggal: "15 Oktober 2025",
        topik: "Sertijab para Kaur",
        pembahasan: [
            "Transisi tugas and tanggung jawab Kepala Urusan memerlukan berita acara serah terima.",
            "Inventarisasi pekerjaan berjalan, serta penetapan target kerja awal guna menjamin keberlanjutan administrasi and koordinasi unit."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBf3gO2YJYhTKY3diYvbrRzAU840PR2YH5kariICMnwjrg?e="
    },
    {
        id: "okt-6", bulan: "Oktober", tanggal: "15 Oktober 2025",
        topik: "Ceremony MoA LM x Papandayan",
        pembahasan: [
            "Finalisasi substansi and ruang lingkup kerja sama, kesiapan dokumen legal and teknis acara.",
            "Penetapan rencana tindak lanjut pasca-penandatanganan agar kerja sama berdampak konkret."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBf3gO2YJYhTKY3diYvbrRzAU840PR2YH5kariICMnwjrg?e="
    },
    {
        id: "okt-7", bulan: "Oktober", tanggal: "15 Oktober 2025",
        topik: "Roadshow BTP",
        pembahasan: [
            "Penentuan tujuan and target audiens roadshow inkubasi/entrepreneurship, penyusunan roadmap and materi sosialisasi.",
            "Mekanisme seleksi and monitoring tenant untuk meningkatkan partisipasi and efektivitas program."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBf3gO2YJYhTKY3diYvbrRzAU840PR2YH5kariICMnwjrg?e="
    },
    // 22 Oktober
    {
        id: "okt-8", bulan: "Oktober", tanggal: "22 Oktober 2025",
        topik: "Sertijab Pengurus JMI 2025",
        pembahasan: [
            "Transisi kepengurusan JMI memerlukan laporan pertanggungjawaban, penetapan program kerja and KPI 2025.",
            "Pembinaan agar keberlanjutan kegiatan (event, publikasi, kompetisi) tetap terjaga."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAnj8_vdd2VQZPo_gLejFp1AWqo3CVodEzm8txeVU1RypU?e=g2JR2R"
    },
    {
        id: "okt-9", bulan: "Oktober", tanggal: "22 Oktober 2025",
        topik: "Finalisasi Aturan AI di Lingkungan FEB",
        pembahasan: [
            "Penggunaan AI dalam pembelajaran and riset belum memiliki regulasi baku.",
            "Perlu klasifikasi penggunaan (allowed/restricted/prohibited), SOP, and pengesahan kebijakan resmi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAnj8_vdd2VQZPo_gLejFp1AWqo3CVodEzm8txeVU1RypU?e=g2JR2R"
    },
    {
        id: "okt-10", bulan: "Oktober", tanggal: "22 Oktober 2025",
        topik: "Timeline Rolling Renstra",
        pembahasan: [
            "Perlu penyesuaian Renstra dengan dinamika kebijakan universitas and capaian aktual melalui evaluasi indikator.",
            "Sinkronisasi IKU/RKAT, serta finalisasi revisi Renstra."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAnj8_vdd2VQZPo_gLejFp1AWqo3CVodEzm8txeVU1RypU?e=g2JR2R"
    },
    {
        id: "okt-11", bulan: "Oktober", tanggal: "22 Oktober 2025",
        topik: "Persiapan Kuliah S3",
        pembahasan: [
            "Inventarisasi dosen calon studi lanjut S3, penyesuaian BKD and plotting mengajar.",
            "Penyusunan roadmap peningkatan kualifikasi dosen guna mendukung target akreditasi and mutu akademik."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAnj8_vdd2VQZPo_gLejFp1AWqo3CVodEzm8txeVU1RypU?e=g2JR2R"
    },
    {
        id: "okt-12", bulan: "Oktober", tanggal: "22 Oktober 2025",
        topik: "Pembentukan Advisory Board",
        pembahasan: [
            "Penguatan governance and linkage industri melalui pembentukan Advisory Board yang terstruktur (TOR, komposisi, KPI kontribusi).",
            "Mendukung akreditasi and internasionalisasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAnj8_vdd2VQZPo_gLejFp1AWqo3CVodEzm8txeVU1RypU?e=g2JR2R"
    },
    // 29 Oktober
    {
        id: "okt-13", bulan: "Oktober", tanggal: "29 Oktober 2025",
        topik: "Arahan Dekan",
        pembahasan: [
            "Penegasan prioritas strategis fakultas (akreditasi, internasionalisasi, tata kelola).",
            "Penyesuaian target IKU/IKF and Renstra, serta kebutuhan penyusunan action plan terstruktur untuk percepatan implementasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBUOXTD1WpiTIIVQLRZEuKpATSlqqKkCKNqT-J-23cITj4?e=N84d67"
    },
    {
        id: "okt-14", bulan: "Oktober", tanggal: "29 Oktober 2025",
        topik: "Diskusi Kerjasama Double Degree dengan IUM",
        pembahasan: [
            "Kesesuaian kurikulum and skema credit transfer, persyaratan akademik and language proficiency.",
            "Legalitas MoU/MoA, serta penyusunan SOP and draft MoA Double Degree."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBUOXTD1WpiTIIVQLRZEuKpATSlqqKkCKNqT-J-23cITj4?e=N84d67"
    },
    {
        id: "okt-15", bulan: "Oktober", tanggal: "29 Oktober 2025",
        topik: "Diskusi Pedoman Penerapan AI di FEB",
        pembahasan: [
            "Penetapan batasan penggunaan AI dalam tugas, ujian, and riset.",
            "Klasifikasi penggunaan (allowed/restricted/prohibited), mitigasi risiko etika akademik, serta finalisasi pedoman and SOP pengawasan."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBUOXTD1WpiTIIVQLRZEuKpATSlqqKkCKNqT-J-23cITj4?e=N84d67"
    },
    {
        id: "okt-16", bulan: "Oktober", tanggal: "29 Oktober 2025",
        topik: "Penyampaian Hasil Rapat dengan ChengDu",
        pembahasan: [
            "Identifikasi peluang kerja sama akademik and riset (mobility, joint research/publication).",
            "Tindak lanjut draft MoU/MoA, and penyusunan rencana aksi kerja sama jangka pendek and menengah."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBUOXTD1WpiTIIVQLRZEuKpATSlqqKkCKNqT-J-23cITj4?e=N84d67"
    },
    {
        id: "okt-17", bulan: "Oktober", tanggal: "29 Oktober 2025",
        topik: "Rebranding Nama Prodi",
        pembahasan: [
            "Kajian kesesuaian nama prodi dengan tren industri and kebutuhan pasar, dampaknya terhadap akreditasi and PDDIKTI.",
            "Penyusunan naskah akademik and proses administratif perubahan nama."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQBUOXTD1WpiTIIVQLRZEuKpATSlqqKkCKNqT-J-23cITj4?e=N84d67"
    },

    // --- NOVEMBER ---
    // 12 November
    {
        id: "nov-1", bulan: "November", tanggal: "12 November 2025",
        topik: "Arahan Dekan",
        pembahasan: [
            "Penegasan arah strategis fakultas (akreditasi, internasionalisasi, riset, employability).",
            "Penyesuaian target IKU, serta percepatan implementasi program prioritas melalui action plan terstruktur."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCKoCZggoD1Sry5L0I-_an9Aaq8Tj28JPJBqm1khBJGrf0?e=DlFwmS"
    },
    {
        id: "nov-2", bulan: "November", tanggal: "12 November 2025",
        topik: "Pembahasan Rolling Renstra",
        pembahasan: [
            "Evaluasi ketercapaian Renstra berjalan, analisis gap target vs realisasi.",
            "Kebutuhan rolling/revisi indikator and timeline agar selaras dengan IKU universitas and kebutuhan akreditasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCKoCZggoD1Sry5L0I-_an9Aaq8Tj28JPJBqm1khBJGrf0?e=DlFwmS"
    },
    {
        id: "nov-3", bulan: "November", tanggal: "12 November 2025",
        topik: "Perumusan Visi, Misi, and Strategi FEB",
        pembahasan: [
            "Penyelarasan visi–misi–strategi FEB dengan arah Universitas melalui workshop lintas pimpinan.",
            "Integrasi prinsip SAFE AI dalam dokumen strategis fakultas."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCKoCZggoD1Sry5L0I-_an9Aaq8Tj28JPJBqm1khBJGrf0?e=DlFwmS"
    },
    {
        id: "nov-4", bulan: "November", tanggal: "12 November 2025",
        topik: "Pembahasan Kurikulum Prodi (Kesesuaian dengan Jurusan/Bidang Pekerjaan)",
        pembahasan: [
            "Evaluasi relevansi kurikulum terhadap kebutuhan industri and tren pasar kerja, penyesuaian CPL.",
            "Integrasi sertifikasi/magang/soft skills, serta revisi struktur mata kuliah berbasis outcome and employability."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCKoCZggoD1Sry5L0I-_an9Aaq8Tj28JPJBqm1khBJGrf0?e=DlFwmS"
    },
    {
        id: "nov-5", bulan: "November", tanggal: "12 November 2025",
        topik: "Rapat Advisory Board",
        pembahasan: [
            "Penguatan masukan strategis dari industri/alumni/mitra.",
            "Integrasi rekomendasi Advisory Board ke dalam Renstra and kurikulum, serta tindak lanjut berbasis kebutuhan stakeholder."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCKoCZggoD1Sry5L0I-_an9Aaq8Tj28JPJBqm1khBJGrf0?e=DlFwmS"
    },
    // 19 November
    {
        id: "nov-6", bulan: "November", tanggal: "19 November 2025",
        topik: "Kunjungan Universitas BSI",
        pembahasan: [
            "Kunjungan benchmarking and penjajakan kerja sama di bidang akademik, riset, MBKM, and internasionalisasi.",
            "Identifikasi peluang kolaborasi konkret serta penunjukan PIC tindak lanjut."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDFTzynxEWBT4p8P1FgouS2Af3rZgTAN_LuXpjn78bWkd0?e=m1g5MG"
    },
    {
        id: "nov-7", bulan: "November", tanggal: "19 November 2025",
        topik: "Arahan Dekan",
        pembahasan: [
            "Penegasan prioritas strategis fakultas, evaluasi capaian program berjalan.",
            "Penyesuaian target IKU, Renstra, and RKAT melalui penyusunan action plan operasional."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDFTzynxEWBT4p8P1FgouS2Af3rZgTAN_LuXpjn78bWkd0?e=m1g5MG"
    },
    {
        id: "nov-8", bulan: "November", tanggal: "19 November 2025",
        topik: "Seleksi and Agenda Microteaching",
        pembahasan: [
            "Belum terstandarnya kriteria seleksi and rubrik penilaian microteaching.",
            "Penetapan panel asesor, mekanisme evaluasi, serta dokumentasi hasil seleksi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDFTzynxEWBT4p8P1FgouS2Af3rZgTAN_LuXpjn78bWkd0?e=m1g5MG"
    },
    {
        id: "nov-9", bulan: "November", tanggal: "19 November 2025",
        topik: "Diskusi dengan Admisi (PMB)",
        pembahasan: [
            "Evaluasi target penerimaan mahasiswa baru, analisis tren and konversi pendaftar.",
            "Penyusunan strategi promosi terintegrasi untuk mendukung capaian PMB per prodi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDFTzynxEWBT4p8P1FgouS2Af3rZgTAN_LuXpjn78bWkd0?e=m1g5MG"
    },

    // --- DESEMBER ---
    // 3 Desember
    {
        id: "des-1", bulan: "Desember", tanggal: "03 Desember 2025",
        topik: "Arahan Dekan",
        pembahasan: [
            "Penegasan prioritas strategis fakultas (akreditasi, internasionalisasi, kinerja akademik and riset), penyesuaian target IKU/Renstra.",
            "Percepatan implementasi program unggulan melalui action plan terstruktur."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCpKdA0M8ncRaoZRTTCSwlFAXcfLJxju_wnY4LlxrrF9IE?e=XKYgDb"
    },
    {
        id: "des-2", bulan: "Desember", tanggal: "03 Desember 2025",
        topik: "Pemenuhan Capaian Konten CDS",
        pembahasan: [
            "Kesesuaian konten pembelajaran dengan standar/learning outcome CDS, gap antara rencana and realisasi.",
            "Kebutuhan penguatan dokumentasi evidence (AoL, RPS, rubrik) and monitoring implementasi."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCpKdA0M8ncRaoZRTTCSwlFAXcfLJxju_wnY4LlxrrF9IE?e=XKYgDb"
    },
    {
        id: "des-3", bulan: "Desember", tanggal: "03 Desember 2025",
        topik: "Pembahasan Kurikulum bersama Grenoble",
        pembahasan: [
            "Kesesuaian struktur kurikulum untuk skema joint/double degree, termasuk matriks ekuivalensi mata kuliah.",
            "Penyesuaian CPL internasional, and penyusunan draft MoA akademik."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQCpKdA0M8ncRaoZRTTCSwlFAXcfLJxju_wnY4LlxrrF9IE?e=XKYgDb"
    },
    // 10 Desember
    {
        id: "des-4", bulan: "Desember", tanggal: "10 Desember 2025",
        topik: "Arahan Dekan",
        pembahasan: [
            "Penegasan prioritas strategis fakultas (akreditasi, internasionalisasi, tata kelola, riset & publikasi), penyesuaian target IKU/Renstra.",
            "Percepatan implementasi program unggulan melalui action plan operasional."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAgwUI8u6SURpQu6vOiR6OTASpBD7mSr45JdRT4x7BekPE?e=EBpdgG"
    },
    {
        id: "des-5", bulan: "Desember", tanggal: "10 Desember 2025",
        topik: "Pemenuhan CDS",
        pembahasan: [
            "Gap antara standar/indikator CDS dengan implementasi aktual, termasuk integrasi CDS dalam RPS and asesmen.",
            "Kelengkapan evidence (AoL, rubrik), serta kebutuhan monitoring and audit internal yang lebih sistematis."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAgwUI8u6SURpQu6vOiR6OTASpBD7mSr45JdRT4x7BekPE?e=EBpdgG"
    },
    {
        id: "des-6", bulan: "Desember", tanggal: "10 Desember 2025",
        topik: "Potensi Kerjasama",
        pembahasan: [
            "Identifikasi and prioritisasi mitra strategis (industri, universitas luar negeri, pemerintah, alumni), evaluasi MoU/MoA aktif and non-aktif.",
            "Penyusunan rencana aksi kerja sama berbasis outcome."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQAgwUI8u6SURpQu6vOiR6OTASpBD7mSr45JdRT4x7BekPE?e=EBpdgG"
    },
    // 17 Desember
    {
        id: "des-7", bulan: "Desember", tanggal: "17 Desember 2025",
        topik: "Arahan Dekan",
        pembahasan: [
            "Penegasan prioritas strategis fakultas, evaluasi capaian target berjalan.",
            "Penyesuaian kebijakan akademik and non-akademik guna penguatan mutu, riset, and kerja sama menuju rencana kerja 2026."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDyozAjy8aDQ7Lfe56zRCEmAfGM8RO-6Zp6xNdtARzNvno?e=cy5aIv"
    },
    {
        id: "des-8", bulan: "Desember", tanggal: "17 Desember 2025",
        topik: "Review Kinerja 2025 & Rencana 2026",
        pembahasan: [
            "Evaluasi capaian IKU/IKT 2025, identifikasi kendala and gap target, realisasi anggaran.",
            "Penyusunan target SMART 2026 yang selaras dengan Renstra Fakultas."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDyozAjy8aDQ7Lfe56zRCEmAfGM8RO-6Zp6xNdtARzNvno?e=cy5aIv"
    },
    {
        id: "des-9", bulan: "Desember", tanggal: "17 Desember 2025",
        topik: "FSDP 2026",
        pembahasan: [
            "Perumusan konsep and tema Faculty Staff Development Program (FSDP) 2026, termasuk kebutuhan peningkatan kompetensi dosen.",
            "Penyusunan TOR & RAB, timeline, serta identifikasi narasumber."
        ],
        link: "https://telkomuniversityofficial-my.sharepoint.com/:b:/g/personal/seb_telkomuniversity_ac_id/IQDyozAjy8aDQ7Lfe56zRCEmAfGM8RO-6Zp6xNdtARzNvno?e=cy5aIv"
    }
];

const monthOrder = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function EvidenceAuditPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter data berdasarkan Topik, Pembahasan (Array), Tanggal, ATAU Bulan
    const filteredData = initialEvidenceData.filter((item) => {
        const query = searchQuery.toLowerCase();
        const isInPembahasan = item.pembahasan.some(p => p.toLowerCase().includes(query));

        return (
            item.topik.toLowerCase().includes(query) ||
            isInPembahasan ||
            item.tanggal.toLowerCase().includes(query) ||
            item.bulan.toLowerCase().includes(query)
        );
    });

    // Kelompokkan data per bulan
    const groupedData = filteredData.reduce((acc, item) => {
        if (!acc[item.bulan]) acc[item.bulan] = [];
        acc[item.bulan].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-6" >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">
                        Rapat Tinjauan Manajemen (RTM)
                    </h1>
                    <p className="text-muted-foreground">
                        Daftar riwayat dan bukti audit berserta tautan lampirannya
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-base-200 dark:bg-accent-900/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>Data RTM 2025</CardTitle>
                    <CardDescription>
                        Visualisasi bukti audit berdasarkan risalah rapat berkala
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari bulan, topik, atau pembahasan..."
                            className="pl-8 bg-accent-100 dark:bg-accent-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-10">
                        {filteredData.length > 0 ? (
                            monthOrder.map((bulan) => {
                                const bulanData = groupedData[bulan];
                                if (!bulanData) return null;

                                return (
                                    <div key={bulan} className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-rose-100 dark:border-rose-900/30">
                                            <Calendar className="h-5 w-5 text-[#e31e25]" />
                                            <h2 className="text-xl font-bold text-base-200 dark:text-accent-100">{bulan}</h2>
                                        </div>
                                        <div className="border rounded-xl overflow-hidden bg-base-200/30 dark:bg-accent-950/30">
                                            <Table>
                                                <TableHeader className="bg-accent-50/50 dark:bg-accent-100">
                                                    <TableRow>
                                                        <TableHead className="w-[60px] text-center font-bold">No</TableHead>
                                                        <TableHead className="w-[150px] font-bold text-accent-900 dark:text-accent-100">Tanggal</TableHead>
                                                        <TableHead className="w-[250px] font-bold text-accent-900 dark:text-accent-100">Topik Utama</TableHead>
                                                        <TableHead className="font-bold text-accent-900 dark:text-accent-100">Detail Pembahasan</TableHead>
                                                        <TableHead className="w-[120px] text-center font-bold">Notula</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {bulanData.map((item, index) => (
                                                        <TableRow key={item.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors">
                                                            <TableCell className="text-center font-medium flex justify-center items-center mt-2">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell className="font-medium align-top pt-4">
                                                                {item.tanggal}
                                                            </TableCell>
                                                            <TableCell className="font-semibold align-top pt-4">
                                                                {item.topik}
                                                            </TableCell>
                                                            <TableCell className="p-4">
                                                                <ul className="list-disc list-outside ml-4 space-y-1">
                                                                    {item.pembahasan.map((poin, idx) => (
                                                                        <li key={idx} className="text-sm leading-relaxed text-accent-600 dark:text-accent-400">
                                                                            {poin}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/50 gap-2 font-medium"
                                                                    onClick={() => window.open(item.link, "_blank")}
                                                                >
                                                                    View <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="border rounded-xl text-center py-20 bg-accent-50/50 dark:bg-accent-100">
                                <div className="text-muted-foreground flex flex-col items-center gap-2">
                                    <Search className="h-10 w-10 opacity-20" />
                                    <p>Tidak menemukan data untuk "{searchQuery}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
