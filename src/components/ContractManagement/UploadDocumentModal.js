import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileBox, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const UploadDocumentModal = ({ onSuccess, children }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type (e.g., PDF)
      if (selectedFile.type !== "application/pdf") {
        toast.error("Hanya file PDF yang diperbolehkan!");
        return;
      }
      
      // Validate size (e.g., max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB!");
        return;
      }
      
      setFile(selectedFile);
      setDocName(selectedFile.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih dokumen terlebih dahulu!");
      return;
    }
    
    if (!docName.trim()) {
      toast.error("Nama dokumen tidak boleh kosong!");
      return;
    }

    setIsUploading(true);

    // MOCK UPLOAD UNTUK DEMO KARENA BACKEND BELUM ADA
    setTimeout(() => {
      toast.success("Berhasil! (Ini hanya simulasi, backend belum diatur)");
      setOpen(false);
      setFile(null);
      setDocName("");
      if (onSuccess) onSuccess();
      setIsUploading(false);
    }, 1500);

    /*
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Note: This endpoint needs to be created on the backend
      const res = await api.post("/api/contract-management/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Dokumen berhasil diunggah!");
        setOpen(false);
        setFile(null);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.data.message || "Gagal mengunggah dokumen!");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setIsUploading(false);
    }
    */
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Dokumen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Dokumen Kontrak Manajemen</DialogTitle>
          <DialogDescription>
            Unggah dokumen fisik atau laporan capaian yang telah disahkan (format PDF, maks. 10MB).
          </DialogDescription>
        </DialogHeader>

        <div className="w-full mt-4">
          {!file ? (
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-slate-500 dark:text-slate-400" />
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Klik untuk mengunggah</span> atau drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF (Maks. 10MB)</p>
              </div>
              <Input
                id="dropzone-file"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          ) : (
            <div className="flex flex-col w-full gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                  <FileBox className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="text-sm font-medium truncate text-slate-700 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-red-600 shrink-0"
                  onClick={() => {
                    setFile(null);
                    setDocName("");
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Nama Dokumen <span className="text-red-500">*</span>
                </label>
                <Input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Masukkan nama dokumen..."
                  disabled={isUploading}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
            }}
            disabled={isUploading}
          >
            Batal
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading} className="min-w-[120px]">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengunggah...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;
