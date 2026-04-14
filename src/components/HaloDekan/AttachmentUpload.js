import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileIcon, X, CheckCircle2, Trash2, FileText, FileImage, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

// Komponen individual untuk setiap file
const FileItem = ({ file, removeFile }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Random increment antara 10 - 25% setiap 200ms
                return prev + Math.floor(Math.random() * 15) + 10;
            });
        }, 400);
        return () => clearInterval(interval);
    }, []);

    const isComplete = progress === 100;
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    // Format ukuran (KB, MB)
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
                    {/* Kotak Icon */}
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-card border border-border/50 flex flex-col items-center justify-center shadow-sm">
                        {isPdf ? (
                            <div className="flex flex-col items-center">
                                <FileText className="h-5 w-5 text-red-500 mb-0.5" />
                                <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-1 rounded-sm">PDF</span>
                            </div>
                        ) : isImage ? (
                            <div className="flex flex-col items-center">
                                <FileImage className="h-5 w-5 text-blue-500 mb-0.5" />
                                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">IMG</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <FileIcon className="h-5 w-5 mb-0.5 text-muted-foreground" />
                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">DOC</span>
                            </div>
                        )}
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

const AttachmentUploader = ({ files, setFiles }) => {
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            fileRejections.forEach(({ file, errors }) => {
                errors.forEach(err => {
                    if (err.code === "file-too-large") {
                        toast.error(`File "${file.name}" terlalu besar! Maksimal 1MB.`, {
                            position: 'top-center',
                            style: { background: "#ef4444", color: "#fff" },
                            iconTheme: { primary: "#ef4444", secondary: "#fff" }
                        })
                    }
                })
            })
            return
        }

        if (files.length + acceptedFiles.length > 3) {
            toast.error("Maksimal hanya boleh 3 lampiran!", {
                position: 'top-center',
                style: { background: "#ef4444", color: "#fff" },
                iconTheme: { primary: "#ef4444", secondary: "#fff" }
            })
            return
        }
        setFiles((prev) => [...prev, ...acceptedFiles])
    }, [files, setFiles])

    const removeFile = (fileToRemove) => {
        setFiles(files.filter(file => file !== fileToRemove))
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 1048576, // 1 MB
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        }
    });

    return (
        <div className="space-y-4">
            <div className={`border-2 p-8 rounded-2xl text-center transition-all duration-200 bg-background
                ${isDragActive ? 'border-primary border-solid bg-primary/5 ring-4 ring-primary/10' : 'border-border border-dashed hover:border-primary/50'}`}
            >
                <div {...getRootProps()} className="focus:outline-none flex flex-col items-center justify-center space-y-4 cursor-pointer">
                    <input {...getInputProps()} />

                    <div className="h-14 w-14 rounded-full bg-muted/50 border border-border/80 flex items-center justify-center mb-1">
                        <UploadCloud className={`h-7 w-7 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[15px] font-bold text-foreground">
                            Choose a file or drag & drop it here
                        </h3>
                        <p className="text-[13px] text-muted-foreground font-medium">
                            JPEG, PNG, PDF, and DOCX formats, up to 1 MB. (Maks 3 File)
                        </p>
                    </div>

                    <Button type="button" variant="outline" className="mt-2 font-bold bg-background text-foreground hover:bg-muted transition-all">
                        Browse File
                    </Button>
                </div>
            </div>

            {/* List File yang di-upload */}
            {files.length > 0 && (
                <div className="space-y-3 pt-2">
                    {files.map((file, idx) => (
                        <FileItem key={idx} file={file} removeFile={removeFile} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentUploader
