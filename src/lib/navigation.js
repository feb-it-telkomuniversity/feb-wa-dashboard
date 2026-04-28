import {
    Home,
    TicketXIcon,
    List,
    AlarmClock,
    Inbox,
    ParkingMeter,
    Newspaper,
    Crosshair,
    GraduationCap,
    Award,
    Users,
    GitGraph,
    WavesLadder,
} from "lucide-react";

export const ROLES = {
    ADMIN: "admin",
    DEKAN: "dekan",
    WADEK_1: "wadek_1",
    WADEK_2: "wadek_2",
    KAUR_SEKDEK: "kaur_sekdek",
    KAUR_LAA: "kaur_laa",
    KAUR_LAB: "kaur_lab",
    KAUR_SDM: "kaur_sdm",
    KAUR_KEMAHASISWAAN: "kaur_kemahasiswaan",
    KAPRODI: "kaprodi",
    SEKPRODI: "sekprodi",
    DOSEN: "dosen",
    MAHASISWA: "mahasiswa"
}

export const navigation = [
    {
        name: "Home",
        href: "/dashboard",
        icon: Home,
    },
    {
        name: "Ticket Management",
        href: "/dashboard/ticket-management",
        icon: TicketXIcon,
        allowedRoles: [ROLES.ADMIN],
        submenu: [
            { name: "Dashboard", href: "/dashboard/ticket-management" },
            { name: "Ticket Archive", href: "/dashboard/ticket-management/ticket-archive" },
            { name: "Tickets", href: "/dashboard/ticket-management/tickets" },
        ],
    },
    {
        name: "Daftar Agenda",
        href: "/dashboard/monitoring-kegiatan",
        icon: List,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN, ROLES.KAPRODI, ROLES.SEKPRODI]
    },
    {
        name: "Reminder",
        href: "/dashboard/reminder",
        icon: AlarmClock,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
        submenu: [
            { name: "Tambah Penerima", href: "/dashboard/reminder/tambah-penerima" },
            { name: "Buat Jadwal", href: "/dashboard/reminder/buat-jadwal" },
            // { name: "Google Calendar", href: "/dashboard/reminder/google-calendar" },
        ],
    },
    {
        name: "Notulensi Rapat",
        href: "/dashboard/notulensi-rapat",
        icon: Inbox,
        allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
    },
    {
        name: "Partnership Monitoring",
        href: "/dashboard/partnership-monitoring",
        icon: ParkingMeter,
        allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
        submenu: [
            { name: "Pengajuan", href: "/dashboard/partnership-monitoring/pengajuan" },
            { name: "Persetujuan & Penerapan", href: "/dashboard/partnership-monitoring/persetujuan-penerapan" },
        ],
    },
    {
        name: "Kontrak Manajemen",
        href: "/dashboard/kontrak-management",
        icon: Newspaper,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN, ROLES.KAPRODI],
    },
    // {
    //     name: "Sasaran Mutu",
    //     href: "/dashboard/sasaran-mutu",
    //     icon: Crosshair,
    //     allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
    // },
    {
        name: "Laporan Manajemen",
        href: "/dashboard/laporan-management",
        icon: Newspaper,
        allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
    },
    {
        name: "Akreditasi LAMEMBA",
        href: "/dashboard/akreditasi-lamemba",
        icon: GraduationCap,
        allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
    },
    {
        name: "Akreditasi AACSB",
        href: "/dashboard/akreditasi-aacsb",
        icon: Award,
        allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
    },
    {
        name: "Data Pegawai",
        href: "/dashboard/jumlah-pegawai",
        icon: Users,
        allowedRoles: [ROLES.ADMIN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN],
    },
    {
        name: "Pusat Bantuan",
        href: "/dashboard/pusat-bantuan",
        icon: GitGraph,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN, ROLES.MAHASISWA],
    },
    {
        name: "RTM",
        href: "/dashboard/rtm",
        icon: GitGraph,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN],
    },
    {
        name: "Halo Dekan",
        href: "/dashboard/halo-dekan",
        icon: WavesLadder,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKAN, ROLES.WADEK_1, ROLES.WADEK_2, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN, ROLES.MAHASISWA, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN],
        submenu: [
            { name: "Pengaduan Baru", href: "/dashboard/halo-dekan/pengaduan-baru", allowedRoles: [ROLES.MAHASISWA] },
            { name: "Riwayat Tiket", href: "/dashboard/halo-dekan/riwayat-tiket", allowedRoles: [ROLES.MAHASISWA] },
            {
                name: "Verifikasi Laporan",
                href: "/dashboard/halo-dekan/verifikasi-laporan",
                allowedRoles: [ROLES.ADMIN]
            },
            {
                name: "Disposisi Laporan",
                href: "/dashboard/halo-dekan/disposisi-laporan",
                allowedRoles: [ROLES.ADMIN, ROLES.DEKAN]
            },
            {
                name: "Tindak Lanjut Pengaduan",
                href: "/dashboard/halo-dekan/tindak-lanjut-pengaduan",
                allowedRoles: [ROLES.WADEK_1, ROLES.WADEK_2, ROLES.KAUR_SEKDEK, ROLES.KAUR_LAA, ROLES.KAUR_LAB, ROLES.KAUR_SDM, ROLES.KAUR_KEMAHASISWAAN, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN]
            },
        ],
    },

]
