'use state'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { PlusIcon } from '../ui/plus-icon'
import { useAuth } from '@/hooks/use-auth'

export const contractManagementSchema = z.object({
    ContractManagementCategory: z.enum([
        "Financial",
        "NonFinancial",
        "InternalBusinessProcess",
    ]),
    responsibility: z.string().min(1, "Responsibility wajib diisi"),
    quarterly: z.enum(["TW-1", "TW-2", "TW-3", "TW-4"]),

    unitOfMeasurement: z.string().optional(),
    unitIds: z.array(z.number()).min(1, "Minimal pilih 1 unit penanggung jawab"),

    weight: z.coerce.number().optional(),
    target: z.string().optional(),

    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    strategy: z.string().optional(),
})

const AddContract = ({ getContractData }) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [units, setUnits] = useState([])
    const { user } = useAuth()

    useEffect(() => {
        if (open) {
            const fetchUnits = async () => {
                try {
                    const res = await api.get('/api/units')
                    setUnits(res.data?.units || [])
                } catch (error) {
                    console.error("Gagal mengambil data unit:", error)
                }
            }
            fetchUnits()
        }
    }, [open])

    const createContractManagement = async (values) => {
        setIsLoading(true)
        try {
            const payload = {
                ...values,
                // Pastikan angka dikonversi benar, dan string kosong jadi null/undefined
                weight: values.weight === "" ? null : Number(values.weight),
                target: values.target === "" ? null : String(values.target),
                min: values.min === "" ? null : Number(values.min),
                max: values.max === "" ? null : Number(values.max),
            }

            const res = await api.post(`/api/contract-management`, payload)
            if (res.status === 200 || res.status === 201) {
                setOpen(false)
                form.reset()
                toast.success("Kontrak KM berhasil ditambahkan", {
                    style: { background: "#059669", color: "#d1fae5" },
                    className: "border border-emerald-500"
                })
                getContractData(1)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Kontrak KM gagal ditambahkan", {
                style: { background: "#fee2e2", color: "#991b1b" },
                className: "border border-red-500"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const form = useForm({
        resolver: zodResolver(contractManagementSchema),
        defaultValues: {
            ContractManagementCategory: "NonFinancial",
            quarterly: "TW-4",
            responsibility: "",
            unitOfMeasurement: "",
            unitIds: [],
            weight: "",
            target: "",
            min: "",
            max: "",
            strategy: "",
        }
    })
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                {user?.role === 'admin' && (
                    <DialogTrigger asChild>
                        <Button><PlusIcon /> Tambah KM</Button>
                    </DialogTrigger>
                )}

                <DialogContent className="sm:max-w-xl w-full">
                    <DialogHeader>
                        <DialogTitle>Tambah Contract Management</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(createContractManagement)}
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

                            {/* ====== SECTION: UNIT PENANGGUNG JAWAB ====== */}
                            <FormField
                                control={form.control}
                                name="unitIds"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-2">
                                            <FormLabel className="text-base">Unit Penanggung Jawab</FormLabel>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-border/50 rounded-md p-4 bg-secondary/10 max-h-56 overflow-y-auto">
                                            {units.length === 0 && (
                                                <div className="text-sm text-muted-foreground italic col-span-full">Memuat unit...</div>
                                            )}
                                            {units.map((unit) => (
                                                <FormField
                                                    key={unit.id}
                                                    control={form.control}
                                                    name="unitIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={unit.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(unit.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), unit.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== unit.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal text-sm cursor-pointer leading-tight">
                                                                    {unit.name} <span className="text-xs text-muted-foreground block mt-0.5">({unit.category})</span>
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
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
                                            <FormLabel>Satuan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: %, Dokumen, dll" {...field} />
                                            </FormControl>
                                            <FormMessage />
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
                                                <Input type="number" step="0.01" {...field} />
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
                                                <Input type="text" {...field} />
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
                                                <Input type="number" {...field} />
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
                                                <Input type="number" {...field} />
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
                                                <Input {...field} />
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

export default AddContract