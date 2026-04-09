import React from 'react';
import { FileText, Image as ImageIcon, Download, FileSpreadsheet, File } from 'lucide-react';

const AttachmentGallery = ({ urls }) => {
    if (!urls || urls.length === 0) return (
        <p className="text-sm text-zinc-500 italic">Tidak ada lampiran.</p>
    )

    const getFileInfo = (url) => {
        const extension = url.split('.').pop().toLowerCase().split('?')[0]

        // Ambil nama file dari URL (opsional, untuk dipajang)
        const fileName = url.split('/').pop().split('-').slice(1).join('-') || `File-${extension}`

        if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
            return { type: 'image', icon: ImageIcon, name: fileName }
        } else if (['pdf'].includes(extension)) {
            return { type: 'pdf', icon: FileText, name: fileName }
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return { type: 'excel', icon: FileSpreadsheet, name: fileName }
        } else {
            return { type: 'document', icon: File, name: fileName }
        }
    }

    return (
        <div className="mt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                ({urls.length}) Attachments
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {urls.map((url, index) => {
                    const { type, icon: Icon, name } = getFileInfo(url)

                    return (
                        <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center p-3 rounded-xl border border-border bg-background hover:bg-background hover:border-primary/50 transition-all duration-300 overflow-hidden"
                        >
                            {/* Jika Gambar, tampilkan Thumbnail */}
                            {type === 'image' ? (
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-primary">
                                    <img
                                        src={url}
                                        alt={`Lampiran ${index + 1}`}
                                        className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            ) : (
                                /* Jika Dokumen, tampilkan Ikon */
                                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 group-hover:border-primary">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                            )}

                            {/* Nama File & Aksi */}
                            <div className="ml-3 min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                    {name}
                                </p>
                                <div className="flex items-center text-xs text-zinc-500 mt-1">
                                    <span className="uppercase">{type}</span>
                                    <span className="mx-2">•</span>
                                    <span className="flex items-center group-hover:text-primary transition-colors">
                                        <Download className="h-3 w-3 mr-1" /> Unduh
                                    </span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default AttachmentGallery;