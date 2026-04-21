'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"

export default function InputRealisasiModal({ open, setOpen, assignment, onSuccess }) {
    const [realization, setRealization] = useState("")
    const [inputNote, setInputNote] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (open && assignment) {
            setRealization(assignment.realization ?? "")
            setInputNote(assignment.inputNote ?? "")
            setError("")
        } else if (!open) {
            setRealization("")
            setInputNote("")
            setError("")
        }
    }, [open, assignment])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (realization === "" || realization === null) {
            setError("Angka Realisasi wajib diisi")
            return
        }

        if (inputNote) {
            try {
                const url = new URL(inputNote)
                if (url.protocol !== "https:") {
                    setError("Link Bukti harus berupa https")
                    return
                }
            } catch (err) {
                setError("Link Bukti tidak valid (harus berupa https://...)")
                return
            }
        }

        try {
            setLoading(true)
            await api.patch(`/api/contract-management/${assignment.id}/update-assignment`, {
                realization: parseFloat(realization),
                inputNote: inputNote || null
            })
            console.log(assignment.id)

            toast.success("Berhasil menyimpan realisasi")
            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (err) {
            console.error(err)
            setError(err?.response?.data?.message || "Gagal menyimpan data")
            toast.error("Gagal menyimpan realisasi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
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
                        <label htmlFor="inputNote" className="text-sm font-medium">
                            Link Bukti
                        </label>
                        <Input
                            id="inputNote"
                            type="url"
                            placeholder="https://..."
                            value={inputNote}
                            onChange={(e) => setInputNote(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            Harus berupa format link https://...
                        </p>
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
