import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, getInitials } from "./halo-dekan-helper";

export function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        styleClass: "bg-gray-100 text-gray-600 border-0",
    };
    return (
        <Badge
            className={`${config.styleClass} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full whitespace-nowrap`}
        >
            {config.label}
        </Badge>
    );
}

export function HaloDekanAvatar({ name, sizeClass = "w-6 h-6 text-[10px]" }) {
    return (
        <div
            className={`${sizeClass} rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center font-semibold text-teal-700 dark:text-teal-400 flex-shrink-0`}
        >
            {getInitials(name)}
        </div>
    );
}

export function StatCard({ label, value, valueClass = "" }) {
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-3.5 border border-primary/50 hover:border-teal-500/20 transition-all">
            <p className="text-[10px] font-medium text-gray-900 dark:text-gray-500 tracking-widest uppercase mb-1">
                {label}
            </p>
            <p className={`text-2xl font-semibold ${valueClass} text-gray-900 dark:text-gray-100`}>
                {value}
            </p>
        </div>
    );
}

export function CategoryBadge({ category }) {
    const CATEGORY_CONFIG = {
        Akademik: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        Fasilitas: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
        Kemahasiswaan: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    };
    const className = CATEGORY_CONFIG[category] ?? "bg-gray-100 text-gray-600";
    return (
        <Badge
            className={`${className} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border-0`}
        >
            {category}
        </Badge>
    );
}
