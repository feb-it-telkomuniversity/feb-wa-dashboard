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
} from "lucide-react";

export const ROLES = {
    ADMIN: "admin",
    DEKANAT: "dekanat",
    KAUR: "kaur",
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
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI]
    },
    {
        name: "Reminder",
        href: "/dashboard/reminder",
        icon: AlarmClock,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR],
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
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR],
    },
    {
        name: "Partnership Monitoring",
        href: "/dashboard/partnership-monitoring",
        icon: ParkingMeter,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR],
        submenu: [
            { name: "Pengajuan", href: "/dashboard/partnership-monitoring/pengajuan" },
            { name: "Persetujuan", href: "/dashboard/partnership-monitoring/persetujuan" },
            { name: "Penerapan", href: "/dashboard/partnership-monitoring/penerapan" },
        ],
    },
    {
        name: "Kontrak Manajemen",
        href: "/dashboard/kontrak-management",
        icon: Newspaper,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR],
    },
    {
        name: "Sasaran Mutu",
        href: "/dashboard/sasaran-mutu",
        icon: Crosshair,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR],
    },
    {
        name: "Laporan Manajemen",
        href: "/dashboard/laporan-management",
        icon: Newspaper,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR],
    },
    {
        name: "Akreditasi LAMEMBA",
        href: "/dashboard/akreditasi-lamemba",
        icon: GraduationCap,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI],
    },
    {
        name: "Akreditasi AACSB",
        href: "/dashboard/akreditasi-aacsb",
        icon: Award,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI],
    },
    {
        name: "Data Pegawai",
        href: "/dashboard/jumlah-pegawai",
        icon: Users,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN],
    },
    {
        name: "Pusat Bantuan",
        href: "/dashboard/pusat-bantuan",
        icon: GitGraph,
        allowedRoles: [ROLES.ADMIN, ROLES.DEKANAT, ROLES.KAUR, ROLES.KAPRODI, ROLES.SEKPRODI, ROLES.DOSEN],
    },
]
