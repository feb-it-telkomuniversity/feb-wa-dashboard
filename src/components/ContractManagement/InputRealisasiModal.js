'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export default function InputRealisasiModal({ open, setOpen, assignment, onSuccess }) {
    const [realizationTw1, setRealizationTw1] = useState("")
    const [realizationTw2, setRealizationTw2] = useState("")
    const [realizationTw3, setRealizationTw3] = useState("")
    const [realizationTw4, setRealizationTw4] = useState("")
    const [inputNote, setInputNote] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (open && assignment) {
            setRealizationTw1(assignment.realizationTw1 ?? "")
            setRealizationTw2(assignment.realizationTw2 ?? "")
            setRealizationTw3(assignment.realizationTw3 ?? "")
            setRealizationTw4(assignment.realizationTw4 ?? "")
            setInputNote(assignment.inputNote ?? "")
            setError("")
        } else if (!open) {
            setRealizationTw1("")
            setRealizationTw2("")
            setRealizationTw3("")
            setRealizationTw4("")
            setInputNote("")
            setError("")
        }
    }, [open, assignment])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            setLoading(true)
            
            const payload = {
                realizationTw1: realizationTw1 !== "" ? parseFloat(realizationTw1) : null,
                realizationTw2: realizationTw2 !== "" ? parseFloat(realizationTw2) : null,
                realizationTw3: realizationTw3 !== "" ? parseFloat(realizationTw3) : null,
                realizationTw4: realizationTw4 !== "" ? parseFloat(realizationTw4) : null,
                inputNote
            }

            await api.patch(`/api/contract-management/${assignment.id}/update-assignment`, payload)

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
                    <DialogTitle>Update Capaian & Realisasi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-600 text-sm text-center p-3 bg-red-100 rounded-md">{error}</div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Realisasi TW-1</label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="Contoh: 80.5"
                                value={realizationTw1}
                                onChange={(e) => setRealizationTw1(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Realisasi TW-2</label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="Contoh: 80.5"
                                value={realizationTw2}
                                onChange={(e) => setRealizationTw2(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Realisasi TW-3</label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="Contoh: 80.5"
                                value={realizationTw3}
                                onChange={(e) => setRealizationTw3(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Realisasi TW-4</label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="Contoh: 80.5"
                                value={realizationTw4}
                                onChange={(e) => setRealizationTw4(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Catatan atau Link Bukti
                        </label>
                        <Textarea
                            placeholder="Masukkan catatan atau paste link dokumen bukti di sini..."
                            value={inputNote}
                            onChange={(e) => setInputNote(e.target.value)}
                            className="resize-none h-24"
                        />
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
