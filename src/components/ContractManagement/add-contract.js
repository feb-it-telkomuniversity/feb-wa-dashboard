'use client'

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
import { Textarea } from '../ui/textarea'

export const contractManagementSchema = z.object({
    ContractManagementCategory: z.enum([
        "Financial",
        "NonFinancial",
        "InternalBusinessProcess",
    ]),
    subCategory: z.enum([
        "KepuasanCustomer",
        "InternalBusinessProcess",
        "PendidikanMahasiswa",
        "RisetAbdimas",
        "PrestasiMahasiswa",
        "Internasionalisasi",
        "SDM",
        "TransformasiDigital",
        "InovasiEntrepreneurship",
        "OperasionalKolaborasi",
        "AkreditasiSertifikasi",
        "PengembanganSDM",
        "DukunganData",
        "RataRataPencapaianPengembanganSumberDaya",
        "RataRataPencapaianDukunganData",
        "Lainnya",
        "none"
    ]).optional(),
    responsibility: z.string().min(1, "Responsibility wajib diisi"),

    unitOfMeasurement: z.string().optional(),
    year: z.string().optional(),
    unitIds: z.array(z.number()).optional(),

    minTw1: z.union([z.string(), z.number()]).optional(),
    minTw2: z.union([z.string(), z.number()]).optional(),
    minTw3: z.union([z.string(), z.number()]).optional(),
    minTw4: z.union([z.string(), z.number()]).optional(),

    maxTw1: z.union([z.string(), z.number()]).optional(),
    maxTw2: z.union([z.string(), z.number()]).optional(),
    maxTw3: z.union([z.string(), z.number()]).optional(),
    maxTw4: z.union([z.string(), z.number()]).optional(),
    strategy: z.string().optional(),
    definition: z.string().optional(),
    objective: z.string().optional(),
    indicatorCalc: z.string().optional(),

    targetTw1: z.string().optional(),
    targetTw2: z.string().optional(),
    targetTw3: z.string().optional(),
    targetTw4: z.string().optional(),

    weightTw1: z.coerce.number().optional(),
    weightTw2: z.coerce.number().optional(),
    weightTw3: z.coerce.number().optional(),
    weightTw4: z.coerce.number().optional(),
})

const SUB_CATEGORY_OPTIONS = [
    { value: "KepuasanCustomer", label: "Kepuasan & Customer" },
    { value: "InternalBusinessProcess", label: "Internal Business Process" },
    { value: "PendidikanMahasiswa", label: "Pendidikan Mahasiswa" },
    { value: "RisetAbdimas", label: "Riset dan Abdimas" },
    { value: "PrestasiMahasiswa", label: "Prestasi Mahasiswa" },
    { value: "Internasionalisasi", label: "Internasionalisasi" },
    { value: "SDM", label: "Sumber Daya Manusia (SDM)" },
    { value: "TransformasiDigital", label: "Transformasi Digital dalam Pembelajaran" },
    { value: "InovasiEntrepreneurship", label: "Inovasi dan Entrepreneurial University" },
    { value: "OperasionalKolaborasi", label: "Operasional & Kolaborasi (Entrepreneur/Academic Support)" },
    { value: "AkreditasiSertifikasi", label: "Akreditasi, Sertifikasi, dan Pembentukan Prodi Baru" },
    { value: "PengembanganSDM", label: "Pengembangan SDM (Kewajiban & Kontrak Manajemen)" },
    { value: "DukunganData", label: "Dukungan Data, Administrasi, dan Kesekretariatan" },
    { value: "RataRataPencapaianPengembanganSumberDaya", label: "Rata-Rata Pencapaian Pengembangan Sumber Daya" },
    { value: "RataRataPencapaianDukunganData", label: "Rata-Rata Pencapaian Dukungan Data, Administrasi, dan Kesekretariatan" },
    { value: "Lainnya", label: "Lainnya" }
]

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
            const cleanSubCategory = values.subCategory === "none" || values.subCategory === "" ? null : values.subCategory;

            const payload = {
                ContractManagementCategory: values.ContractManagementCategory,
                subCategory: cleanSubCategory,
                responsibility: values.responsibility,
                unitOfMeasurement: values.unitOfMeasurement,
                year: values.year,
                unitIds: values.unitIds,
                minTw1: values.minTw1 === "" ? null : Number(values.minTw1),
                minTw2: values.minTw2 === "" ? null : Number(values.minTw2),
                minTw3: values.minTw3 === "" ? null : Number(values.minTw3),
                minTw4: values.minTw4 === "" ? null : Number(values.minTw4),
                maxTw1: values.maxTw1 === "" ? null : Number(values.maxTw1),
                maxTw2: values.maxTw2 === "" ? null : Number(values.maxTw2),
                maxTw3: values.maxTw3 === "" ? null : Number(values.maxTw3),
                maxTw4: values.maxTw4 === "" ? null : Number(values.maxTw4),
                targetTw1: values.targetTw1 === "" ? null : String(values.targetTw1),
                targetTw2: values.targetTw2 === "" ? null : String(values.targetTw2),
                targetTw3: values.targetTw3 === "" ? null : String(values.targetTw3),
                targetTw4: values.targetTw4 === "" ? null : String(values.targetTw4),
                weightTw1: values.weightTw1 === "" ? null : Number(values.weightTw1),
                weightTw2: values.weightTw2 === "" ? null : Number(values.weightTw2),
                weightTw3: values.weightTw3 === "" ? null : Number(values.weightTw3),
                weightTw4: values.weightTw4 === "" ? null : Number(values.weightTw4),
                strategy: values.strategy,
                definition: values.definition,
                objective: values.objective,
                indicatorCalc: values.indicatorCalc,
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
            subCategory: "none",
            responsibility: "",
            unitOfMeasurement: "",
            year: "",
            unitIds: [],
            minTw1: "", minTw2: "", minTw3: "", minTw4: "",
            maxTw1: "", maxTw2: "", maxTw3: "", maxTw4: "",
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

                <DialogContent className="sm:max-w-5xl w-full">
                    <DialogHeader>
                        <DialogTitle>Tambah Contract Management</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(createContractManagement)}
                            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
                        >
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

                            {/* ====== SECTION: KATEGORI & SUB KATEGORI ====== */}
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
                                    name="subCategory"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Sub Category</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih sub category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-muted-foreground italic">-- Kosongkan (Tidak Ada) --</SelectItem>
                                                    {SUB_CATEGORY_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ====== SECTION: TAHUN, & SATUAN ====== */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tahun</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="2024"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="unitOfMeasurement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Satuan</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Unit Satuan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Hari Kerja">Hari Kerja</SelectItem>
                                                    <SelectItem value="Bulan">Bulan</SelectItem>
                                                    <SelectItem value="Minggu Ke">Minggu Ke</SelectItem>
                                                    <SelectItem value="Jumlah">Jumlah</SelectItem>
                                                    <SelectItem value="%">%</SelectItem>
                                                    <SelectItem value="Skor">Skor</SelectItem>
                                                    <SelectItem value="Rupiah">Rupiah</SelectItem>
                                                    <SelectItem value="Tanggal">Tanggal</SelectItem>
                                                    <SelectItem value="Jam">Jam</SelectItem>
                                                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ====== SECTION: UNIT PENANGGUNG JAWAB ====== */}
                            <FormField
                                control={form.control}
                                name="unitIds"
                                render={({ field }) => {
                                    const uniqueCategories = Array.from(new Set(units.map(u => u.category).filter(Boolean)));

                                    const handleToggleCategory = (category) => {
                                        const currentValues = field.value || [];
                                        const categoryUnitIds = units.filter(u => u.category === category).map(u => u.id);
                                        const isAllSelected = categoryUnitIds.length > 0 && categoryUnitIds.every(id => currentValues.includes(id));

                                        if (isAllSelected) {
                                            field.onChange(currentValues.filter(id => !categoryUnitIds.includes(id)));
                                        } else {
                                            field.onChange(Array.from(new Set([...currentValues, ...categoryUnitIds])));
                                        }
                                    };

                                    return (
                                        <FormItem>
                                            <div className="mb-2">
                                                <FormLabel className="text-base">Unit Penanggung Jawab</FormLabel>
                                                {uniqueCategories.length > 0 && (
                                                    <div className="flex flex-wrap gap-3 mt-2 mb-2">
                                                        {uniqueCategories.map(category => {
                                                            const currentValues = field.value || [];
                                                            const categoryUnitIds = units.filter(u => u.category === category).map(u => u.id);
                                                            const isAllSelected = categoryUnitIds.length > 0 && categoryUnitIds.every(id => currentValues.includes(id));

                                                            return (
                                                                <div key={category} className="flex items-center space-x-2 bg-secondary/20 px-2.5 py-1.5 rounded-md border border-border/50">
                                                                    <Checkbox
                                                                        id={`cat-${category}`}
                                                                        checked={isAllSelected}
                                                                        onCheckedChange={() => handleToggleCategory(category)}
                                                                    />
                                                                    <label htmlFor={`cat-${category}`} className="text-xs cursor-pointer select-none font-medium">
                                                                        Semua {category}
                                                                    </label>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
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
                                                        render={({ field: subField }) => {
                                                            return (
                                                                <FormItem
                                                                    key={unit.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={subField.value?.includes(unit.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? subField.onChange([...(subField.value || []), unit.id])
                                                                                    : subField.onChange(
                                                                                        subField.value?.filter(
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
                                    )
                                }}
                            />

                            {/* ====== SECTION: TARGET & BOBOT ====== */}
                            <div className="border border-border/50 rounded-md overflow-hidden bg-secondary/5 mt-4">
                                <div className="grid grid-cols-2 divide-x divide-border/50 border-b border-border/50 bg-secondary/20 text-center">
                                    <div className="py-2 text-sm font-medium">Bobot</div>
                                    <div className="py-2 text-sm font-medium">Target</div>
                                </div>
                                <div className="grid grid-cols-8 divide-x divide-border/50 border-b border-border/50 bg-secondary/10 text-center text-xs text-muted-foreground">
                                    {[1, 2, 3, 4].map((q) => <div key={`hw-${q}`} className="py-2">TW {q}</div>)}
                                    {[1, 2, 3, 4].map((q) => <div key={`ht-${q}`} className="py-2">TW {q}</div>)}
                                </div>
                                <div className="grid grid-cols-8 divide-x divide-border/50 bg-background">
                                    {[1, 2, 3, 4].map((q) => (
                                        <div key={`weight-${q}`} className="p-2">
                                            <FormField control={form.control} name={`weightTw${q}`} render={({ field }) => (
                                                <FormItem><FormControl><Input type="number" step="0.01" className="h-8 text-center px-1 text-xs" placeholder="-" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    ))}
                                    {[1, 2, 3, 4].map((q) => (
                                        <div key={`target-${q}`} className="p-2">
                                            <FormField control={form.control} name={`targetTw${q}`} render={({ field }) => (
                                                <FormItem><FormControl><Input className="h-8 text-center px-1 text-xs" placeholder="-" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ====== SECTION: MIN & MAX ====== */}
                            <div className="border border-border/50 rounded-md overflow-hidden bg-secondary/5 mt-4">
                                <div className="grid grid-cols-2 divide-x divide-border/50 border-b border-border/50 bg-secondary/20 text-center">
                                    <div className="py-2 text-sm font-medium">Min</div>
                                    <div className="py-2 text-sm font-medium">Max</div>
                                </div>
                                <div className="grid grid-cols-8 divide-x divide-border/50 border-b border-border/50 bg-secondary/10 text-center text-xs text-muted-foreground">
                                    {[1, 2, 3, 4].map((q) => <div key={`hmin-${q}`} className="py-2">TW {q}</div>)}
                                    {[1, 2, 3, 4].map((q) => <div key={`hmax-${q}`} className="py-2">TW {q}</div>)}
                                </div>
                                <div className="grid grid-cols-8 divide-x divide-border/50 bg-background">
                                    {[1, 2, 3, 4].map((q) => (
                                        <div key={`min-${q}`} className="p-2">
                                            <FormField control={form.control} name={`minTw${q}`} render={({ field }) => (
                                                <FormItem><FormControl><Input type="number" step="0.01" className="h-8 text-center px-1 text-xs" placeholder="-" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    ))}
                                    {[1, 2, 3, 4].map((q) => (
                                        <div key={`max-${q}`} className="p-2">
                                            <FormField control={form.control} name={`maxTw${q}`} render={({ field }) => (
                                                <FormItem><FormControl><Input type="number" step="0.01" className="h-8 text-center px-1 text-xs" placeholder="-" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    ))}
                                </div>
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

export default AddContract