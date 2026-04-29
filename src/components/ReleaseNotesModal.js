import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, Check, ArrowRight } from 'lucide-react';

const updateTrigger = "update-2026-04-29";

const newFeatures = [
    "Rilis Fitur 'Halo Dekan': Mahasiswa kini dapat mengirimkan pengaduan fasilitas/akademik beserta bukti foto secara langsung.",
    "Pelacakan Tiket Real-time: Mahasiswa dapat memantau status aduan hingga tahap 'Resolution View' (melihat bukti perbaikan dari fakultas).",
    "Input Realisasi Kaprodi: Unit penanggung jawab sekarang dapat menginput capaian Kontrak Manajemen secara mandiri via sistem.",
    "Sistem Unggah Dokumen: Mendukung upload file bukti (Excel, PDF, Gambar) hingga 3MB yang tersimpan aman di cloud storage.",
    "Peningkatan Keamanan: Perbaikan stabilitas pengiriman email OTP untuk proses login yang lebih lancar."
];

// ==========================================

export default function WhatsNewModal() {
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const lastSeenUpdate = localStorage.getItem('mira_last_seen_update');
        // Hanya munculkan jika user belum menceklis "Jangan tampilkan lagi" untuk ID update ini
        if (lastSeenUpdate !== updateTrigger) {
            const timer = setTimeout(() => setOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        // Logika baru: HANYA simpan ke localStorage JIKA checkbox dicentang
        if (isChecked) {
            localStorage.setItem('mira_last_seen_update', updateTrigger);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white dark:bg-gray-950">

                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/30 dark:via-gray-950 dark:to-indigo-950/20 px-6 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                            <Megaphone className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold text-primary/80 dark:text-primary/80 tracking-wide uppercase">
                                Pengumuman Sistem
                            </span>
                        </div>
                    </div>

                    <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Apa yang baru di MIRA?
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                        Kami terus meningkatkan sistem MIRA. Berikut adalah beberapa pembaruan utama pada rilis kali ini:
                    </DialogDescription>
                </div>

                {/* Content Section - Dibuat Scrollable */}
                <div className="px-6 py-4 bg-white dark:bg-gray-950">
                    <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="space-y-4 my-2">
                            {newFeatures.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3 group">
                                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 pt-2 bg-white dark:bg-gray-950 flex flex-col gap-4 border-t border-gray-50 dark:border-gray-900 mt-2">
                    {/* Checkbox Section */}
                    <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-700 rounded-md checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-colors"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                            />
                            <Check className="absolute text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 select-none group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                            Mengerti, jangan tampilkan pesan ini lagi.
                        </span>
                    </label>

                    {/* Action Button */}
                    <Button
                        onClick={handleClose}
                        className="w-full h-11 rounded-xl text-base font-medium transition-transform active:scale-[0.98]"
                    >
                        Lanjutkan Pekerjaan
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}