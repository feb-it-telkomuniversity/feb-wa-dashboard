'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FileEdit, LoaderIcon } from 'lucide-react'
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from "@/components/ui/checkbox"
import { ActivityMultiSelect } from './activity-multi-select'
import api from '@/lib/axios'

const docTypeOptions = [
    { label: "MoA", value: "MoA" },
    { label: "MoU", value: "MoU" },
    { label: "IA", value: "IA" },
]

const scopeOptions = [
    { label: "Nasional", value: "national" },
    { label: "Internasional", value: "international" },
]

const partnershipTypeOptions = [
    { label: "Akademik", value: "Akademik" },
    { label: "Penelitian", value: "Penelitian" },
    { label: "Abdimas", value: "Abdimas" },
]

const activityTypeOptions = [
    {
        label: "Sub Akademik",
        options: [
            { label: "Joint Degree", value: "JointDegree" },
            { label: "Double Degree", value: "DoubleDegree" },
            { label: "Joint Class", value: "JointClass" },
            { label: "Student Exchange", value: "StudentExchange" },
            { label: "Visiting Professor", value: "VisitingProfessor" },
        ],
    },
    {
        label: "Sub Penelitian",
        options: [
            { label: "Joint Research", value: "JointResearch" },
            { label: "Joint Publication", value: "JointPublication" },
        ],
    },
    {
        label: "Sub Abdimas",
        options: [
            { label: "Joint Community Service", value: "JointCommunityService" },
            { label: "Social Project", value: "SocialProject" },
        ],
    },
    {
        label: "Umum",
        options: [
            { label: "General", value: "General" },
        ],
    }
]

const EditSubmission = ({ partnershipId, partnership, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const toDateInput = (isoString) => {
        if (!isoString) return ""
        return isoString.split("T")[0]
    }

    const form = useForm({
        defaultValues: {
            partnerName: partnership?.partnerName || "",
            yearIssued: partnership?.yearIssued || new Date().getFullYear().toString(),
            docType: partnership?.docType || undefined,
            scope: partnership?.scope || undefined,
            picExternal: partnership?.picExternal || "",
            picExternalPhone: partnership?.picExternalPhone || "",
            picInternal: partnership?.picInternal || "",
            docNumberInternal: partnership?.docNumberInternal || "",
            docNumberExternal: partnership?.docNumberExternal || "",
            partnershipType: partnership?.partnershipType || undefined,
            activityType: partnership?.activities?.map(a => a.name || a.type) || [],
            dateCreated: toDateInput(partnership?.dateCreated) || "",
            signingType: partnership?.signingType || "",
            dateSigned: toDateInput(partnership?.dateSigned) || "",
            validUntil: toDateInput(partnership?.validUntil) || "",
            duration: partnership?.duration || "",
            docLink: partnership?.docLink || "",
            notes: partnership?.notes || "",
            hasHardcopy: partnership?.hasHardcopy || false,
            hasSoftcopy: partnership?.hasSoftcopy || false,
        }
    })

    const selectedPartnershipType = form.watch("partnershipType")
    const filteredActivityOptions = React.useMemo(() => {
        if (!selectedPartnershipType) return []

        const allowedLabels = ["Umum"]
        if (selectedPartnershipType === "Akademik") allowedLabels.push("Sub Akademik")
        if (selectedPartnershipType === "Penelitian") allowedLabels.push("Sub Penelitian")
        if (selectedPartnershipType === "Abdimas") allowedLabels.push("Sub Abdimas")

        return activityTypeOptions.filter(group => allowedLabels.includes(group.label))
    }, [selectedPartnershipType])

    React.useEffect(() => {
        if (partnership?.partnershipType && selectedPartnershipType !== partnership.partnershipType) {
            form.setValue("activityType", [])
            form.clearErrors("activityType")
        }
    }, [selectedPartnershipType, partnership?.partnershipType, form])

    const handleSubmit = async (values) => {
        if (!partnership.id) {
            toast.error("Yah...ID Partnership tidak ditemukan", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
            return
        }

        const processValue = (value) => {
            if (value === undefined) return undefined;
            if (value === "") return null;
            return value
        }

        const normalizeDate = (dateString) => {
            if (!dateString) return null
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return null
            return date.toISOString() // Mengubah "2024-01-01" jadi "2024-01-01T00:00:00.000Z"
        }

        try {
            setIsLoading(true)
            const payload = {
                yearIssued: values.yearIssued || undefined,
                docType: values.docType || undefined,
                partnerName: values.partnerName || "",
                scope: values.scope || undefined,
                picExternal: values.picExternal || "",
                picExternalPhone: values.picExternalPhone || "",
                picInternal: values.picInternal || "",

                docNumberInternal: values.docNumberInternal || "",
                docNumberExternal: values.docNumberExternal || "",

                partnershipType: values.partnershipType || undefined,
                activities: values.activityType || undefined,

                // --- Tanggal & Signing ---
                dateCreated: normalizeDate(values.dateCreated),
                signingType: processValue(values.signingType),
                dateSigned: normalizeDate(values.dateSigned),
                validUntil: normalizeDate(values.validUntil),
                duration: processValue(values.duration),

                // --- Arsip ---
                docLink: processValue(values.docLink),
                notes: values.notes,
                hasHardcopy: values.hasHardcopy, // Boolean
                hasSoftcopy: values.hasSoftcopy,
            }

            const res = await api.put(`/api/partnership/${partnershipId}`, payload)
            console.log(res);

            toast.success("Yess...Dokumen berhasil diperbarui", {
                position: 'top-center',
                style: { background: "#059669", color: "#d1fae5" },
                className: "border border-emerald-500",
            })
            form.reset()
            setOpen(false)

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            // console.error("Gagal memperbarui approval:", error)
            toast.error(error?.response?.data?.message || "Oops...Dokumen gagal diperbarui, boleh dicoba lagi yuk", {
                position: 'top-center',
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto text-left" variant="ghost"><FileEdit className='size-4 text-emerald-500' />Edit Partnership</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl w-full p-6">
                <DialogHeader>
                    <DialogTitle>Edit mitra yang sudah kamu tambahkan sebelumnya</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="partnership-form"
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 max-h-[70vh] overflow-y-auto pr-1"
                    >
                        {/* Informasi dasar */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">Informasi Dasar</h4>
                            <div className="grid gap-2 md:grid-cols-2 space-y-2">
                                <FormField
                                    control={form.control}
                                    name="partnerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Mitra</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cth: Royal Ignatius" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yearIssued"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tahun Terbit</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1900" max="2100" placeholder="2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="docType"
                                    render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <FormLabel>Tipe Dokumen</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih tipe dokumen" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {docTypeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scope"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lingkup Kerjasama</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih lingkup" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {scopeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* PIC Kontak */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">PIC & Kontak</h4>
                            <div className="grid gap-2 md:grid-cols-2 space-y-2">
                                <FormField
                                    control={form.control}
                                    name="picExternal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PIC Eksternal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama PIC Eksternal" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="picExternalPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. PIC Eksternal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="81234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="picInternal"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>PIC Internal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama PIC Internal" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Nomor Dokumen */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">Nomor Dokumen</h4>
                            <div className="grid gap-2 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="docNumberInternal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nomor Dokumen Internal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cth: 001/SPIO/VI/2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="docNumberExternal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nomor Dokumen Eksternal</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cth: 002/MITRA/VII/2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Tipe kerjasama */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">Jenis Kerjasama</h4>
                            <div className="grid gap-2 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="partnershipType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipe Kerjasama</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih tipe kerjasama" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {partnershipTypeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="activityType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Aktivitas</FormLabel>
                                            <FormControl>
                                                <ActivityMultiSelect
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    activityTypeOptions={filteredActivityOptions}
                                                    disabled={isLoading || !selectedPartnershipType}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">Tanggal & Penandatanganan</h4>
                            <div className="grid gap-2 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="dateCreated"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Dibuat</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="signingType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Metode Penandatanganan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cth: Online / Onsite" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dateSigned"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal TTD</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Berlaku Sampai</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Durasi</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Cth: "3 tahun"' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">Arsip & Lainnya</h4>
                            <div className="grid gap-2 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="docLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link Arsip</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://drive.google.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Catatan</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Catatan penting terkait kerjasama" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="hasHardcopy"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <FormLabel className="text-base">Arsip Hardcopy</FormLabel>
                                                    <p className="text-sm text-slate-500">Tersedia fisik di arsip?</p>
                                                </div>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hasSoftcopy"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <FormLabel className="text-base">Arsip Softcopy</FormLabel>
                                                    <p className="text-sm text-slate-500">Tersedia file digital?</p>
                                                </div>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" form="partnership-form" disabled={isLoading}>
                        {isLoading ?
                            <div className="flex justify-center items-center text-center gap-2 ">
                                <LoaderIcon className="animate-spin size-4" /> <span>Mengubah data...</span>
                            </div>
                            : "Edit data Mitra"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EditSubmission