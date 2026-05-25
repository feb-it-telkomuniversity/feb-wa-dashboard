'use client'

import { useMemo, useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ActivityMultiSelect({ 
  value = [], 
  onValueChange, 
  activityTypeOptions, 
  allActivityTypeOptions,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const optionsToSearch = allActivityTypeOptions || activityTypeOptions;

  const getLabelByValue = (val) => {
    for (const group of optionsToSearch) {
      const found = group.options.find((opt) => opt.value === val)
      if (found) return found.label
    }
    return val
  }

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return activityTypeOptions

    return activityTypeOptions.map(group => {
      // Filter options di dalam group
      const matchingOptions = group.options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // Kembalikan group baru dengan options yang sudah difilter
      return {
        ...group,
        options: matchingOptions
      }
    }).filter(group => group.options.length > 0)
  }, [activityTypeOptions, searchQuery])

  const handleSelectOption = (optionValue) => {
    const isSelected = value.includes(optionValue)

    if (isSelected) {
        onValueChange(value.filter((val) => val !== optionValue))
    } else {
        onValueChange([...value, optionValue])
    }
  }

  const handleRemoveItem = (itemToRemove) => {
    onValueChange(value.filter(v => v !== itemToRemove))
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(val => (
            <div
              key={val}
              className="flex items-center gap-2 bg-red-100 text-red-900 px-3 py-1 rounded-full text-sm"
            >
              <span className="font-medium">{getLabelByValue(val)}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(val)}
                className="hover:bg-red-200 rounded-full p-0.5 transition-colors ml-1"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Search */}
      <div className="relative">
        <div
          className={cn(
            'flex items-center gap-2 border rounded-md px-3 py-2 bg-background cursor-pointer hover:bg-muted/50 transition-colors',
            isOpen && 'ring-2 ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <input
            type="text"
            placeholder={value.length === 0 ? 'Cari dan pilih ruang lingkup kerjasama...' : 'Tambah ruang lingkup lainnya...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => !disabled && setIsOpen(true)}
            className="flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground text-sm"
            disabled={disabled}
          />
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Tidak ada aktivitas yang cocok.
                </div>
              ) : (
                <div className="py-2">
                    {filteredGroups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            {/* Group Label */}
                            <div className="px-4 py-2 text-xs font-bold text-muted-foreground bg-slate-50 dark:bg-slate-900 uppercase tracking-wider sticky top-0">
                                {group.label}
                            </div>

                            {/* Options */}
                            {group.options.map(option => {
                                const isSelected = value.includes(option.value)
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelectOption(option.value)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group",
                                            isSelected && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>
              )}
            </div>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </div>
  )
}