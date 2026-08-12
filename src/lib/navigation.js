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
    Mail,
    PenTool,
    CalendarCheck,
} from "lucide-react";

export const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    MAHASISWA: "mahasiswa",
    DOSEN: "dosen",
    DEKANAT: "dekanat",
    WADEK: "wadek",
    KAUR: "kaur",
    TPA: "tpa",
    KAPRODI: "kaprodi",
    SEKPRODI: "sekprodi",
    KETUA_KK: "ketua_kk",
    UMUM: "umum"
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
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
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
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.WADEK]
    },
    {
        name: "Manajemen Acara",
        href: "/dashboard/manajemen-acara",
        icon: CalendarCheck,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.WADEK],
        submenu: [
            { name: "Dashboard", href: "/dashboard/manajemen-acara" },
            { name: "Kanban Board", href: "/dashboard/manajemen-acara/kanban" },
            { name: "Timeline Acara", href: "/dashboard/manajemen-acara/timeline" },
            { name: "Laporan Kegiatan", href: "/dashboard/manajemen-acara/laporan" },
        ]
    },
    {
        name: "Administrasi",
        href: "/dashboard/surat-menyurat",
        icon: Mail,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.WADEK],
        submenu: [
            {
                name: "Notulensi Rapat",
                href: "/dashboard/notulensi-rapat",
                icon: Inbox,
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR, ROLES.DEKANAT],
            },
            {
                name: "Administrasi Surat",
                href: "/dashboard/surat-menyurat",
            },
            {
                name: "Log TTD Dekan",
                href: "/dashboard/log-tanda-tangan",
            },
        ],
    },
    {
        name: "Reminder",
        href: "/dashboard/reminder",
        icon: AlarmClock,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.WADEK],
        submenu: [
            { name: "Tambah Penerima", href: "/dashboard/reminder/tambah-penerima" },
            { name: "Buat Jadwal", href: "/dashboard/reminder/buat-jadwal" },
            // { name: "Google Calendar", href: "/dashboard/reminder/google-calendar" },
        ],
    },
    {
        name: "Kerjasama",
        href: "/dashboard/kerjasama",
        icon: ParkingMeter,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR, ROLES.DEKANAT, ROLES.WADEK],
        submenu: [
            {
                name: "Pengajuan",
                href: "/dashboard/kerjasama/pengajuan",
                allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TPA, ROLES.DOSEN],
            },
            {
                name: "Monitoring",
                href: "/dashboard/kerjasama/monitoring",
            },
        ],
    },
    {
        name: "Manajemen",
        href: "/dashboard/kontrak-management",
        icon: Newspaper,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.KETUA_KK, ROLES.WADEK],
        submenu: [
            {
                name: "RTM Old",
                href: "/dashboard/rtm-old",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.WADEK],
            },
            {
                name: "RTM",
                href: "/dashboard/rtm",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.WADEK],
            },
            {
                name: "Kontrak Manajemen",
                href: "/dashboard/kontrak-management",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.KETUA_KK, ROLES.WADEK],
            },
            {
                name: "Laporan Manajemen",
                href: "/dashboard/laporan-management",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR, ROLES.DEKANAT, ROLES.WADEK],
            },
        ],
    },
    {
        name: "Akreditasi",
        href: "/dashboard/akreditasi-lamemba",
        icon: GraduationCap,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR, ROLES.DEKANAT, ROLES.KAPRODI, ROLES.SEKPRODI],
        submenu: [
            {
                name: "Akreditasi LAMEMBA",
                href: "/dashboard/akreditasi-lamemba",
            },
            {
                name: "Akreditasi AACSB",
                href: "/dashboard/akreditasi-aacsb",
            },
        ],
    },
    {
        name: "Data Pegawai",
        href: "/dashboard/jumlah-pegawai",
        icon: Users,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KAUR, ROLES.DEKANAT, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN],
    },
    {
        name: "Halo Dekan",
        href: "/dashboard/halo-dekan",
        icon: WavesLadder,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.WADEK, ROLES.KAUR, ROLES.MAHASISWA, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN, ROLES.TPA, ROLES.UMUM],
        submenu: [
            { name: "Pengaduan Baru", href: "/dashboard/halo-dekan/pengaduan-baru", allowedRoles: [ROLES.MAHASISWA, ROLES.DOSEN, ROLES.UMUM] },
            { name: "Riwayat Tiket", href: "/dashboard/halo-dekan/riwayat-tiket", allowedRoles: [ROLES.MAHASISWA, ROLES.DOSEN, ROLES.UMUM] },
            {
                name: "Verifikasi Laporan",
                href: "/dashboard/halo-dekan/verifikasi-laporan",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TPA]
            },
            {
                name: "Disposisi Laporan",
                href: "/dashboard/halo-dekan/disposisi-laporan",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT]
            },
            {
                name: "Tindak Lanjut Pengaduan",
                href: "/dashboard/halo-dekan/tindak-lanjut-pengaduan",
                allowedRoles: [ROLES.WADEK, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.KETUA_KK]
            },
            {
                name: "Monitoring Laporan",
                href: "/dashboard/halo-dekan/monitoring-laporan",
                allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.WADEK, ROLES.DEKANAT]
            },
        ],
    },
    {
        name: "Pusat Bantuan",
        href: "/dashboard/pusat-bantuan",
        icon: GitGraph,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN, ROLES.MAHASISWA, ROLES.WADEK, ROLES.KETUA_KK, ROLES.TPA, ROLES.UMUM],
    },
]

