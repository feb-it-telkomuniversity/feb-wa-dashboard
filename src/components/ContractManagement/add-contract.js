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

export const contractManagementSchema = z.object({
    ContractManagementCategory: z.enum([
        "Financial",
        "NonFinancial",
        "InternalBusinessProcess",
    ]),
    responsibility: z.string().min(1, "Responsibility wajib diisi"),

    unitOfMeasurement: z.string().optional(),
    unitIds: z.array(z.number()).min(1, "Minimal pilih 1 unit penanggung jawab"),

    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    strategy: z.string().optional(),

    targetTw1: z.string().optional(),
    targetTw2: z.string().optional(),
    targetTw3: z.string().optional(),
    targetTw4: z.string().optional(),

    weightTw1: z.coerce.number().optional(),
    weightTw2: z.coerce.number().optional(),
    weightTw3: z.coerce.number().optional(),
    weightTw4: z.coerce.number().optional(),
})

const AddContract = ({ getContractData }) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [units, setUnits] = useState([])

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
                ContractManagementCategory: values.ContractManagementCategory,
                responsibility: values.responsibility,
                unitOfMeasurement: values.unitOfMeasurement,
                unitIds: values.unitIds,
                min: values.min === "" ? null : Number(values.min),
                max: values.max === "" ? null : Number(values.max),
                strategy: values.strategy,
                targetTw1: values.targetTw1 === "" ? null : String(values.targetTw1),
                targetTw2: values.targetTw2 === "" ? null : String(values.targetTw2),
                targetTw3: values.targetTw3 === "" ? null : String(values.targetTw3),
                targetTw4: values.targetTw4 === "" ? null : String(values.targetTw4),
                weightTw1: values.weightTw1 === "" ? null : Number(values.weightTw1),
                weightTw2: values.weightTw2 === "" ? null : Number(values.weightTw2),
                weightTw3: values.weightTw3 === "" ? null : Number(values.weightTw3),
                weightTw4: values.weightTw4 === "" ? null : Number(values.weightTw4),
            }

            const res = await api.post(`/api/contract-management`, payload)
            if (res.status === 200 || res.status === 201) {
                setOpen(false)
                form.reset()
                toast.success(`Berhasil menambahkan KM`, {
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
            responsibility: "",
            unitOfMeasurement: "",
            unitIds: [],
            min: "",
            max: "",
            strategy: "",
            targetTw1: "",
            targetTw2: "",
            targetTw3: "",
            targetTw4: "",
            weightTw1: "",
            weightTw2: "",
            weightTw3: "",
            weightTw4: "",
        }
    })
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button><PlusIcon /> Tambah KM</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-2xl w-full">
                    <DialogHeader>
                        <DialogTitle>Tambah Contract Management</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(createContractManagement)}
                            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
                        >
                            {/* ====== SECTION: KATEGORI ====== */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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