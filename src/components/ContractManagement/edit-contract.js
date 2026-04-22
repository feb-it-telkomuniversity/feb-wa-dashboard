'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import axios from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { EditIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'

export const contractManagementSchema = z.object({
    ContractManagementCategory: z.enum([
        "Financial",
        "NonFinancial",
        "InternalBusinessProcess",
    ]),
    quarterly: z.string().min(1, "Triwulan wajib diisi"),
    responsibility: z.string().min(1, "Responsibility wajib diisi"),

    unitOfMeasurement: z.string().optional(),
    weight: z.union([z.string(), z.number()]).optional(),
    target: z.string().optional(),

    min: z.union([z.string(), z.number()]).optional(),
    max: z.union([z.string(), z.number()]).optional(),

    strategy: z.string().optional(),
    definition: z.string().optional(),
    objective: z.string().optional(),
    indicatorCalc: z.string().optional(),
})

const EditContract = ({ getContractData, contractId, isLoading, setIsLoading, open, setOpen }) => {
    const [hasFetched, setHasFetched] = useState(false)
    const form = useForm({
        resolver: zodResolver(contractManagementSchema),
        defaultValues: {
            ContractManagementCategory: "NonFinancial",
            quarterly: "TW-4",
            responsibility: "",
            unitOfMeasurement: "",
            weight: "",
            target: "",
            min: "",
            max: "",
            strategy: "",
            definition: "",
            objective: "",
            indicatorCalc: "",
        }
    })

    useEffect(() => {
        if (open && contractId && !hasFetched) {
            const fetchContractDetail = async () => {
                try {
                    const res = await api.get(`/api/contract-management/${contractId}`)

                    const data = res.data.data || res.data

                    // Populate form dengan data yang di-fetch
                    form.reset({
                        ContractManagementCategory: data.ContractManagementCategory || "NonFinancial",
                        quarterly: data.quarterly || "TW-4",
                        responsibility: data.responsibility || "",
                        unitOfMeasurement: data.unitOfMeasurement || "",
                        weight: data.weight?.toString() || "",
                        target: data.target || "",
                        min: data.min?.toString() || "",
                        max: data.max?.toString() || "",
                        strategy: data.strategy || "",
                        definition: data.definition || "",
                        objective: data.objective || "",
                        indicatorCalc: data.indicatorCalc || ""
                    })
                    setHasFetched(true)
                } catch (error) {
                    console.error("Error fetching contract detail:", error)
                    toast.error("Gagal memuat data kontrak", {
                        style: { background: "#fee2e2", color: "#991b1b" },
                        className: "border border-red-500"
                    })
                    setOpen(false)
                } finally {
                }
            }

            fetchContractDetail()
        }
    }, [open, contractId, hasFetched])

    // Reset flag ketika dialog ditutup
    useEffect(() => {
        if (!open) {
            setHasFetched(false)
            form.reset({
                ContractManagementCategory: "NonFinancial",
                quarterly: "TW-4",
                responsibility: "",
                unitOfMeasurement: "",
                weight: "",
                target: "",
                min: "",
                max: "",
                strategy: "",
                definition: "",
                objective: "",
                indicatorCalc: "",
            })
        }
    }, [open])

    const editContractManagement = async (values) => {
        setIsLoading(true)
        try {
            const payload = {
                ...values,
                weight: values.weight === "" ? null : Number(values.weight),
                target: values.target === "" ? null : String(values.target),
                min: values.min === "" ? null : Number(values.min),
                max: values.max === "" ? null : Number(values.max),
            }

            const res = await api.put(`/api/contract-management/${contractId}`, payload)

            if (res.status === 200 || res.status === 201) {
                setOpen(false)
                setHasFetched(false)
                form.reset({
                    ContractManagementCategory: "NonFinancial",
                    quarterly: "TW-4",
                    responsibility: "",
                    unitOfMeasurement: "",
                    weight: "",
                    target: "",
                    min: "",
                    max: "",
                    strategy: "",
                    definition: "",
                    objective: "",
                    indicatorCalc: "",
                })
                toast.success("Kontrak KM berhasil diperbarui", {
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500"
                })
                getContractData(1)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Kontrak KM gagal diperbarui", {
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Contract Management</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(editContractManagement)}
                            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
                        >
                            {/* ====== SECTION: KATEGORI ====== */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ContractManagementCategory"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Kategori</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih kategori" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Financial">Financial</SelectItem>
                                                    <SelectItem value="NonFinancial">Non Financial</SelectItem>
                                                    <SelectItem value="InternalBusinessProcess">
                                                        Internal Business Process
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quarterly"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Triwulan</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih TW" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TW-1">TW-1</SelectItem>
                                                    <SelectItem value="TW-2">TW-2</SelectItem>
                                                    <SelectItem value="TW-3">TW-3</SelectItem>
                                                    <SelectItem value="TW-4">TW-4</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ====== RESPONSIBILITY ====== */}
                            <FormField
                                control={form.control}
                                name="responsibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Responsibility</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Contoh: Operating Ratio Fakultas"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ====== SECTION: NUMERIC ====== */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="unitOfMeasurement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="%, Jumlah, Skor"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bobot</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="target"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="min"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Min</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="max"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ====== SECTION: CATATAN ====== */}
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="strategy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Strategy</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="definition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Definisi</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Contoh: Realisasi penyerapan Total beban dibandingkan Total Pendapatan"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="objective"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tujuan</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Contoh: Pengukuran kemampuan mengendalikan beban sesuai dengan kemampuan menghasilkan pendapatan"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="indicatorCalc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Perhitungan Indikator</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Contoh: Jumlah realisasi operating ratio dibandingkan dengan target operating ratio sesuai RKA yang dihitung secara kumulatif"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Batal
                                </Button>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        "Simpan Data KM"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default EditContract