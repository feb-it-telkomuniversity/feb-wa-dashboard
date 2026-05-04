import { 
    AlignJustify, 
    AlignCenter, 
    Menu 
} from "lucide-react";

export const DENSITY_OPTIONS = [
    {
        key: "compact",
        label: "Compact",
        icon: AlignJustify,
        cellClass: "py-1.5 px-3",
        headClass: "py-2 px-3",
        textSize: "text-xs",
        avatarSize: "w-5 h-5 text-[9px]",
    },
    {
        key: "comfortable",
        label: "Comfortable",
        icon: AlignCenter,
        cellClass: "py-2.5 px-3",
        headClass: "py-2.5 px-3",
        textSize: "text-sm",
        avatarSize: "w-6 h-6 text-[10px]",
    },
    {
        key: "spacious",
        label: "Spacious",
        icon: Menu,
        cellClass: "py-4 px-3",
        headClass: "py-3.5 px-3",
        textSize: "text-sm",
        avatarSize: "w-8 h-8 text-xs",
    },
];

export const STATUS_CONFIG = {
    Submitted: { styleClass: "bg-blue-100 text-blue-800 border-0 dark:bg-blue-900/30 dark:text-blue-400", label: "Submitted" },
    InProgress: { styleClass: "bg-sky-100 text-sky-600 border-0 dark:bg-sky-800/30 dark:text-sky-300", label: "In Progress" },
    AssignedToUnit: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
    WaitingApproval: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Waiting Approval" },
    RevisionNeeded: { styleClass: "bg-yellow-100 text-yellow-800 border-0 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Assigned to Unit" },
    Resolved: { styleClass: "bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Resolved" },
    Rejected: { styleClass: "bg-red-100 text-red-800 border-0 dark:bg-red-900/30 dark:text-red-400", label: "Rejected" },
    Cancelled: { styleClass: "bg-gray-100 text-gray-800 border-0 dark:bg-gray-900/30 dark:text-gray-400", label: "Cancelled" },
};

export const CATEGORY_CONFIG = {
    Akademik: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    Fasilitas: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    Kemahasiswaan: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export const FILTER_OPTIONS = [
    { key: "all", label: "Semua" },
    { key: "Resolved", label: "Resolved" },
    { key: "InProgress", label: "In Progress" },
    { key: "Submitted", label: "Submitted" },
    { key: "Rejected", label: "Rejected" },
];

export function getInitials(name = "") {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

export function formatDate(dateString) {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateString));
}
