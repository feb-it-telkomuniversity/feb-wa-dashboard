'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Edit2, Layers, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import AddUnit from '@/components/Units/add-unit';
import EditUnit from '@/components/Units/edit-unit';
import DeleteUnit from '@/components/Units/delete-unit';

const UNIT_CATEGORIES = ['Fakultas', 'Wadek', 'KK', 'Prodi', 'Kaur', 'Umum'];

const CATEGORY_COLORS = {
    'Fakultas': 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    'Wadek': 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
    'KK': 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
    'Prodi': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    'Kaur': 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    'Umum': 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400',
    'default': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
};

const UnitsPage = () => {
    const [units, setUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUnits = units.filter(
        (unit) =>
            unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const fetchUnits = async () => {
        try {
            const res = await api.get('/api/units')
            setUnits(res.data.units || [])
        } catch (error) {
            console.error("Failed to fetch units:", error);
        }
    }

    useEffect(() => {
        fetchUnits()
    }, [])

    // Get unique categories for stats
    const categories = [...new Set(units.map(u => u.category))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Unit Management</h1>
                            <p className="text-muted-foreground mt-1">Kelola data unit kerja dengan mudah dan terpusat</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors">
                        <CardContent className="pt-6">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Unit</p>
                                <p className="text-3xl font-bold">{units.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    {UNIT_CATEGORIES.map((category) => (
                        <Card key={category} className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors">
                            <CardContent className="pt-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Kategori {category}</p>
                                    <p className="text-2xl font-bold">{units.filter((u) => u.category === category).length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="flex-1">
                        <div className="relative group">
                            <Input
                                placeholder="Cari unit berdasarkan nama atau kategori..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-4 pr-10 h-11 bg-card/40 backdrop-blur-sm border-border/40 group-hover:border-primary/50 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <AddUnit onSuccess={fetchUnits} categories={UNIT_CATEGORIES} />
                </div>

                {/* Unit Grid */}
                <div className="space-y-4">
                    {filteredUnits.length === 0 ? (
                        <Card className="border-border/40 bg-card/40 backdrop-blur-sm h-64 flex items-center justify-center">
                            <CardContent>
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center opacity-20">
                                        <Building2 className="w-16 h-16" />
                                    </div>
                                    <p className="text-muted-foreground font-medium text-lg">
                                        {searchQuery ? `Tidak ada unit dengan kata kunci "${searchQuery}"` : 'Belum ada data unit yang tersedia'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredUnits.map((unit) => (
                                <Card key={unit.id} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                            <div className="flex items-start gap-5 flex-1">
                                                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/20 transition-colors h-fit">
                                                    <Layers className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{unit.name}</h3>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <span className={`px-4 py-1 rounded-lg text-xs font-bold border shadow-sm ${CATEGORY_COLORS[unit.category] || CATEGORY_COLORS['default']}`}>
                                                            {unit.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 sm:flex-col sm:min-w-32">
                                                <EditUnit unit={unit} onSuccess={fetchUnits} categories={UNIT_CATEGORIES} />
                                                <DeleteUnit
                                                    isLoading={isLoading}
                                                    setIsLoading={setIsLoading}
                                                    unitId={unit.id}
                                                    onSuccess={fetchUnits}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UnitsPage