'use client'

import { Card, CardContent } from '@/components/ui/card';
import { User, Briefcase, GraduationCap, MapPin, Mail, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AlumniGridView = ({ alumniList }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {alumniList.map((alumni) => {
                const isWorking = alumni.status_saat_ini?.toLowerCase().includes("bekerja") && !alumni.status_saat_ini?.toLowerCase().includes("belum");
                return (
                    <Card 
                        key={alumni.nim} 
                        className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-md flex flex-col h-full"
                    >
                        <CardContent className="p-0 flex flex-col h-full">
                            {/* Header Section */}
                            <div className="p-4 border-b border-border/40 bg-muted/20 relative">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors" title={alumni.nama_lengkap}>
                                            {alumni.nama_lengkap || "-"}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                                                {alumni.nim || "-"}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Angkatan {alumni.angkatan || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body Section */}
                            <div className="p-4 flex flex-col gap-4 flex-1">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm">
                                        <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-foreground font-medium">{alumni.prodi || "-"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-sm">
                                        <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-foreground font-medium">
                                                {alumni.status_saat_ini || "Tidak Diketahui"}
                                            </span>
                                            {isWorking && alumni.nama_perusahaan && (
                                                <span className="text-muted-foreground text-xs mt-0.5 flex flex-col gap-0.5">
                                                    <span>{alumni.nama_perusahaan}</span>
                                                    {alumni.bidang_pekerjaan && (
                                                        <span className="italic text-primary/70">{alumni.bidang_pekerjaan}</span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {isWorking && alumni.alamat_perusahaan && (
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span className="text-xs line-clamp-2">{alumni.alamat_perusahaan}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        {alumni.email && (
                                            <a href={`mailto:${alumni.email}`} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1" title={alumni.email}>
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Email</span>
                                            </a>
                                        )}
                                        {alumni.linkedin && (
                                            <a href={alumni.linkedin.startsWith('http') ? alumni.linkedin : `https://${alumni.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">LinkedIn</span>
                                            </a>
                                        )}
                                    </div>
                                    
                                    {isWorking && alumni.linear_prodi && (
                                        <Badge variant={alumni.linear_prodi?.toLowerCase().includes("tidak") ? "outline" : "default"} className="text-[10px] uppercase">
                                            {alumni.linear_prodi}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
