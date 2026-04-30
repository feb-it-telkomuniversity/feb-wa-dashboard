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
    responsibility: z.string().min(1, "Responsibility wajib diisi"),

    unitOfMeasurement: z.string().optional(),
    
    targetTw1: z.string().optional(),
    targetTw2: z.string().optional(),
    targetTw3: z.string().optional(),
    targetTw4: z.string().optional(),

    weightTw1: z.union([z.string(), z.number()]).optional(),
    weightTw2: z.union([z.string(), z.number()]).optional(),
    weightTw3: z.union([z.string(), z.number()]).optional(),
    weightTw4: z.union([z.string(), z.number()]).optional(),

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
            responsibility: "",
            unitOfMeasurement: "",
            targetTw1: "",
            targetTw2: "",
            targetTw3: "",
            targetTw4: "",
            weightTw1: "",
            weightTw2: "",
            weightTw3: "",
            weightTw4: "",
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
                        responsibility: data.responsibility || "",
                        unitOfMeasurement: data.unitOfMeasurement || "",
                        targetTw1: data.targetTw1 || "",
                        targetTw2: data.targetTw2 || "",
                        targetTw3: data.targetTw3 || "",
                        targetTw4: data.targetTw4 || "",
                        weightTw1: data.weightTw1?.toString() || "",
                        weightTw2: data.weightTw2?.toString() || "",
                        weightTw3: data.weightTw3?.toString() || "",
                        weightTw4: data.weightTw4?.toString() || "",
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
                responsibility: "",
                unitOfMeasurement: "",
                targetTw1: "",
                targetTw2: "",
                targetTw3: "",
                targetTw4: "",
                weightTw1: "",
                weightTw2: "",
                weightTw3: "",
                weightTw4: "",
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
                targetTw1: values.targetTw1 === "" ? null : String(values.targetTw1),
                targetTw2: values.targetTw2 === "" ? null : String(values.targetTw2),
                targetTw3: values.targetTw3 === "" ? null : String(values.targetTw3),
                targetTw4: values.targetTw4 === "" ? null : String(values.targetTw4),
                weightTw1: values.weightTw1 === "" ? null : Number(values.weightTw1),
                weightTw2: values.weightTw2 === "" ? null : Number(values.weightTw2),
                weightTw3: values.weightTw3 === "" ? null : Number(values.weightTw3),
                weightTw4: values.weightTw4 === "" ? null : Number(values.weightTw4),
                min: values.min === "" ? null : Number(values.min),
                max: values.max === "" ? null : Number(values.max),
            }

            const res = await api.put(`/api/contract-management/${contractId}`, payload)

            if (res.status === 200 || res.status === 201) {
                setOpen(false)
                setHasFetched(false)
                form.reset({
                    ContractManagementCategory: "NonFinancial",
                    responsibility: "",
                    unitOfMeasurement: "",
                    targetTw1: "",
                    targetTw2: "",
                    targetTw3: "",
                    targetTw4: "",
                    weightTw1: "",
                    weightTw2: "",
                    weightTw3: "",
                    weightTw4: "",
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
                            <div className="grid grid-cols-1 gap-4">
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
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="unitOfMeasurement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Satuan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: %, Dokumen, dll" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ====== SECTION: TARGET & BOBOT ====== */}
                            <div className="border border-border/50 rounded-md overflow-hidden bg-secondary/5 mt-4">
                                <div className="grid grid-cols-2 divide-x divide-border/50 border-b border-border/50 bg-secondary/20 text-center">
                                    <div className="py-2 text-sm font-medium">Target</div>
                                    <div className="py-2 text-sm font-medium">Bobot</div>
                                </div>
                                <div className="grid grid-cols-8 divide-x divide-border/50 border-b border-border/50 bg-secondary/10 text-center text-xs text-muted-foreground">
                                    <div className="py-2">TW 1</div>
                                    <div className="py-2">TW 2</div>
                                    <div className="py-2">TW 3</div>
                                    <div className="py-2">TW 4</div>
                                    <div className="py-2">TW 1</div>
                                    <div className="py-2">TW 2</div>
                                    <div className="py-2">TW 3</div>
                                    <div className="py-2">TW 4</div>
                                </div>
                                <div className="grid grid-cols-8 divide-x divide-border/50 bg-background">
                                    {[1, 2, 3, 4].map((q) => (
                                        <div key={`target-${q}`} className="p-2">
                                            <FormField
                                                control={form.control}
                                                name={`targetTw${q}`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input className="h-8 text-center px-1 text-xs" placeholder="-" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ))}
                                    {[1, 2, 3, 4].map((q) => (
                                        <div key={`weight-${q}`} className="p-2">
                                            <FormField
                                                control={form.control}
                                                name={`weightTw${q}`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" className="h-8 text-center px-1 text-xs" placeholder="-" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
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