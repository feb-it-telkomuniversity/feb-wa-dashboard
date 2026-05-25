import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, X } from "lucide-react";
import { navigation } from "@/lib/navigation";

// Extract all valid menu options from navigation
const menuOptions = [];
navigation.forEach(item => {
    // Only add items that have a name and aren't Home or basic ones if we want to restrict, 
    // but let's just add everything that has a specific href
    if (item.name && item.href !== "/dashboard") {
        menuOptions.push({ name: item.name, path: item.href });
    }
    if (item.submenu) {
        item.submenu.forEach(sub => {
            menuOptions.push({ name: `${item.name} - ${sub.name}`, path: sub.href });
        });
    }
});

export function MenuMultiSelect({ selectedMenus, onChange }) {
    // selectedMenus is an array of string paths (hrefs) or names
    // We will store paths in the backend since they are robust.

    const toggleMenu = (path) => {
        if (selectedMenus.includes(path)) {
            onChange(selectedMenus.filter((m) => m !== path));
        } else {
            onChange([...selectedMenus, path]);
        }
    };

    const removeMenu = (path) => {
        onChange(selectedMenus.filter((m) => m !== path));
    };

    return (
        <div className="space-y-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between rounded-xl h-12 px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm font-normal"
                    >
                        <span className="truncate">
                            {selectedMenus.length > 0
                                ? `${selectedMenus.length} Menu Tambahan Terpilih`
                                : "Pilih Akses Menu Tambahan..."}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl max-w-[80vw] sm:max-w-none" align="start">
                    <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                        {menuOptions.map((option, idx) => {
                            const isSelected = selectedMenus.includes(option.path);
                            return (
                                <div
                                    key={idx}
                                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                    onClick={() => toggleMenu(option.path)}
                                >
                                    <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-primary bg-primary text-white" : "border-gray-300 dark:border-gray-600"}`}>
                                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-sm leading-snug ${isSelected ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                                        {option.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>

            {selectedMenus.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-800">
                    {selectedMenus.map((path, idx) => {
                        const opt = menuOptions.find((m) => m.path === path);
                        const label = opt ? opt.name : path;
                        return (
                            <div
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 shadow-sm text-sm"
                            >
                                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                                <button
                                    onClick={() => removeMenu(path)}
                                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-red-500"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
