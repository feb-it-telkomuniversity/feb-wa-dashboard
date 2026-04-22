'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, UploadCloud, X, FileSpreadsheet, CheckCircle2, Trash2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import api from "@/lib/axios"
import { toast } from "sonner"
import MiniAttachmentViewer from "./MiniAttachmentViewer"

const FileItem = ({ file, removeFile }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 10;
            });
        }, 600);
        return () => clearInterval(interval);
    }, []);

    const isComplete = progress === 100;

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const currentSize = isComplete ? file.size : (file.size * (progress / 100));

    return (
        <div className="flex flex-col p-4 bg-background border border-border/80 shadow-sm rounded-xl transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-card border border-border/50 flex flex-col items-center justify-center shadow-sm">
                        <div className="flex flex-col items-center">
                            <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-500 mb-0.5" />
                            <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest bg-green-500/10 px-1 rounded-sm">XLS</span>
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden w-full">
                        <span className="text-sm font-bold text-foreground truncate">{file.name}</span>
                        <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-2">
                            <span className="font-medium text-foreground/70">{formatSize(currentSize)} of {formatSize(file.size)}</span>
                            <span className="text-muted-foreground/30">•</span>
                            {isComplete ? (
                                <span className="flex items-center text-emerald-500 font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Completed
                                </span>
                            ) : (
                                <span className="flex items-center text-blue-500 font-semibold">
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                    Uploading...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 ml-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 transition-colors ${isComplete ? 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10' : 'text-foreground hover:bg-muted font-bold'
                            }`}
                        onClick={() => removeFile(file)}
                    >
                        {isComplete ? <Trash2 className="h-4 w-4" /> : <X className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Progress Bar Line */}
            <div className={`mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden transition-opacity duration-500 ${isComplete ? 'opacity-0 h-0 mt-0' : 'opacity-100'}`}>
                <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default function InputRealisasiModal({ open, setOpen, assignment, onSuccess }) {
    const [realization, setRealization] = useState("")
    const [files, setFiles] = useState([])
    const [inputNote, setInputNote] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (open && assignment) {
            setRealization(assignment.realization ?? "")
            setInputNote(assignment.inputNote ?? "")
            setFiles([])
            setError("")
        } else if (!open) {
            setRealization("")
            setInputNote("")
            setFiles([])
            setError("")
        }
    }, [open, assignment])

    const onDrop = (acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            fileRejections.forEach(({ file, errors }) => {
                errors.forEach(err => {
                    if (err.code === "file-too-large") {
                        toast.error(`File terlalu besar! Maksimal 1MB.`, {
                            position: 'top-center',
                            style: { background: "#fee2e2", color: "#991b1b" },
                            className: "border border-red-500"
                        })
                    } else if (err.code === "file-invalid-type") {
                        toast.error(`Hanya file Excel (.xls, .xlsx) yang diperbolehkan!`, {
                            position: 'top-center',
                            style: { background: "#fee2e2", color: "#991b1b" },
                            className: "border border-red-500"
                        })
                    }
                })
            })
            return
        }
        if (acceptedFiles.length > 0) {
            setFiles([acceptedFiles[0]])
        }
    }

    const removeFile = () => {
        setFiles([])
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 1048576,
        maxFiles: 1,
        accept: {
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (realization === "" || realization === null) {
            setError("Angka Realisasi wajib diisi")
            return
        }

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append("realization", realization)

            if (inputNote) {
                formData.append("inputNote", inputNote)
            }
            if (files.length > 0) {
                formData.append("fileBukti", files[0])
            }

            await api.patch(`/api/contract-management/${assignment.id}/update-assignment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            toast.success("Berhasil menyimpan realisasi", {
                position: 'top-center',
                style: { background: "#dcfce7", color: "#166534" },
                className: "border border-green-500"
            })
            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Gagal menyimpan data")
            toast.error("Gagal menyimpan realisasi", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Input Realisasi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-600 text-sm text-center p-3 bg-red-100 rounded-md">{error}</div>
                    )}
                    <div className="grid gap-2">
                        <label htmlFor="realization" className="text-sm font-medium">
                            Angka Realisasi <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="realization"
                            type="number"
                            step="any"
                            placeholder="Contoh: 80.5"
                            value={realization}
                            onChange={(e) => setRealization(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Dokumen Bukti (Excel)
                        </label>
                        {!files.length ? (
                            <div className={`border-2 p-6 rounded-xl text-center transition-all duration-200 bg-background
                                ${isDragActive ? 'border-primary border-solid bg-primary/5' : 'border-border border-dashed hover:border-primary/50'}`}
                            >
                                <div {...getRootProps()} className="focus:outline-none flex flex-col items-center justify-center space-y-3 cursor-pointer">
                                    <input {...getInputProps()} />
                                    <div className="h-10 w-10 rounded-full bg-muted/50 border border-border/80 flex items-center justify-center">
                                        <UploadCloud className={`h-5 w-5 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Drag & drop atau klik di sini
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Hanya file .xls, .xlsx (Maks 5MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <FileItem file={files[0]} removeFile={() => removeFile(files[0])} />
                        )}
                        {inputNote && !files.length && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                <span className="block pb-2">Lihat dokumen bukti tersimpan saat ini</span>
                                <MiniAttachmentViewer url={inputNote} />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
