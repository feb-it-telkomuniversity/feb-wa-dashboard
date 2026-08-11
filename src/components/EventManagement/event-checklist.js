'use client'

import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function EventChecklist({ checklist = [], onUpdate }) {
    const [newItemText, setNewItemText] = useState('')

    const handleAddItem = (e) => {
        e.preventDefault()
        if (!newItemText.trim()) return

        const newItem = {
            id: Date.now().toString(),
            text: newItemText.trim(),
            completed: false
        }
        onUpdate([...checklist, newItem])
        setNewItemText('')
    }

    const handleToggleItem = (itemId) => {
        const updated = checklist.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
        )
        onUpdate(updated)
    }

    const handleRemoveItem = (itemId) => {
        const updated = checklist.filter(item => item.id !== itemId)
        onUpdate(updated)
    }

    const completedCount = checklist.filter(item => item.completed).length
    const totalCount = checklist.length
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Persiapan Checklist ({completedCount}/{totalCount})</span>
                <span className="text-xs text-muted-foreground font-medium">{progress}% Selesai</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-primary h-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {checklist.map(item => (
                    <div 
                        key={item.id} 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-all group"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox 
                                id={`item-${item.id}`}
                                checked={item.completed}
                                onCheckedChange={() => handleToggleItem(item.id)}
                            />
                            <label 
                                htmlFor={`item-${item.id}`}
                                className={`text-sm cursor-pointer select-none truncate ${
                                    item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                }`}
                            >
                                {item.text}
                            </label>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {checklist.length === 0 && (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        Belum ada item checklist persiapan.
                    </div>
                )}
            </div>

            {/* Form Tambah */}
            <form onSubmit={handleAddItem} className="flex gap-2">
                <Input 
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Tambah persiapan baru..."
                    className="h-9 text-sm"
                />
                <Button type="submit" size="sm" className="h-9 gap-1">
                    <Plus className="h-4 w-4" />
                    Tambah
                </Button>
            </form>
        </div>
    )
}
