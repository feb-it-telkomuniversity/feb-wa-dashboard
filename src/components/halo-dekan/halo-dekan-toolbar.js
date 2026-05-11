import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FILTER_OPTIONS, DENSITY_OPTIONS } from "./halo-dekan-helper";

export function HaloDekanToolbar({ 
    searchQuery, 
    setSearchQuery, 
    activeFilter, 
    setActiveFilter, 
    activeDensity, 
    setActiveDensity 
}) {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Cari kode, kategori, atau nama..."
                    className="pl-9 text-sm rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 flex-wrap">
                {FILTER_OPTIONS.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => setActiveFilter(opt.key)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeFilter === opt.key
                            ? "bg-teal-600 text-white border-teal-600 dark:bg-teal-500 dark:border-teal-500"
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Density toggle */}
            <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden sm:block">
                    Tampilan
                </span>
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {DENSITY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setActiveDensity(opt.key)}
                                title={opt.label}
                                className={`px-2.5 py-1.5 transition-all border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${activeDensity === opt.key
                                    ? "bg-teal-600 text-white dark:bg-teal-500"
                                    : "bg-white text-gray-400 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
