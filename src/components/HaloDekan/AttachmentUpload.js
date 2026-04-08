import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const AttachmentUploader = ({ files, setFiles }) => {
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        // Cek jika ada file yang ditolak (misal karena ukuran)
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
            <div
                {...getRootProps()}
                className={`border-2 border-dashed p-6 rounded-xl text-center cursor-pointer transition-all duration-200
                    ${isDragActive ? 'border-primary bg-[#dcb38f]/10' : 'border-zinc-700 hover:border-primary/50 bg-zinc-900/50'}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-zinc-400'}`} />
                    <p className="text-sm text-zinc-300">
                        {isDragActive ? "Lepaskan file di sini..." : "Tarik & lepas file di sini, atau klik untuk memilih"}
                    </p>
                    <p className="text-xs text-zinc-500">
                        Mendukung: JPG, PNG, PDF, DOCX, XLSX (Maks. 3 File, @1MB)
                    </p>
                </div>
            </div>

            {/* Preview File yang dipilih */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <FileIcon className="w-4 h-4 text-[#dcb38f] flex-shrink-0" />
                                <span className="text-sm text-zinc-300 truncate">{file.name}</span>
                                <span className="text-xs text-zinc-500">({(file.size / 1024).toFixed(0)} KB)</span>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => removeFile(file)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentUploader
