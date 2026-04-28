"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { CheckCircle2, CheckCircleIcon, CircleDashed, Clock, Dock, FileOutputIcon, LoaderIcon, PlusCircle } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Form } from "../ui/form"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import api from "@/lib/axios"


const activityStatusOptions = [
    { value: "Terlaksana", label: "Terlaksana", color: "bg-emerald-500", icon: CheckCircle2 },
    { value: "BelumTerlaksana", label: "Belum Terlaksana", color: "bg-amber-500", icon: Clock },
]

const ProgressBarActivity = ({ activities }) => {
    const total = activities.length;
    const done = activities.filter(a => a.status?.toLowerCase() === "terlaksana").length;
    const percentage = total > 0 ? (done / total) * 100 : 0;

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress Pelaksanaan Aktivitas</span>
                <span className="text-sm font-bold text-[#e31e25]">{done}/{total} Terlaksana</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-red-300 to-[#b71c1c] transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};


const ActivityCard = ({ activity, value, onChange }) => {
    const selected = activityStatusOptions.find(opt => opt.value === value?.status)
    const Icon = selected?.icon || CircleDashed

    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${selected?.color || 'bg-slate-200'} flex items-center justify-center transition-colors duration-300`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        {activity.isNew ? (
                            <Input
                                value={value?.type || ""}
                                onChange={(e) => onChange({ ...value, type: e.target.value })}
                                placeholder="Nama Aktivitas"
                                className="h-7 text-sm font-semibold mb-1 w-full border-slate-300 px-2"
                            />
                        ) : (
                            <h5 className="font-semibold text-slate-800">{activity.type}</h5>
                        )}
                        <p className="text-xs text-slate-500">{selected?.label || "Belum dipilih"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {activityStatusOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = value?.status === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange({ ...value, status: option.value })}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${isSelected
                                        ? `${option.color} text-white shadow-md scale-105`
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:scale-[1.02]'}`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs">{option.label}</span>
                            </button>
                        )
                    })}
                </div>

                <Textarea
                    value={value?.notes || ""}
                    onChange={(e) => onChange({ ...value, notes: e.target.value })}
                    className="w-full min-h-[70px] text-sm p-2 border border-slate-300 rounded-lg transition mt-4 text-slate-800 focus:outline-none"
                    placeholder="Catatan aktivitas (opsional)"
                    rows={2}
                />

                <div className="mt-3 relative">
                    <Input
                        value={value?.evidenceLink || ""}
                        onChange={(e) => onChange({ ...value, evidenceLink: e.target.value })}
                        className="w-full h-9 text-xs border-slate-300 pl-10 pr-20"
                        placeholder="Link GDrive / Nama File Bukti"
                    />
                    <FileOutputIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    
                    {/* Simulated Upload Button */}
                    <input 
                        type="file"
                        id={`upload-file-${activity.id}`}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0];
                                onChange({ ...value, evidenceLink: file.name });
                                // Note: For a real backend integration, you would upload this 'file' via FormData to your endpoint
                                // and get a URL back to save as evidenceLink. For now, we simulate by putting the file name.
                            }
                        }}
                    />
                    <Button 
                        type="button" 
                        variant="secondary" 
                        className="absolute right-1 top-1 h-7 text-[10px] px-2 bg-slate-100 hover:bg-slate-200"
                        onClick={() => document.getElementById(`upload-file-${activity.id}`).click()}
                    >
                        Pilih File
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function EditStatusActivityPartnership({ partnershipId, activities, onSuccess }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [localActivities, setLocalActivities] = useState([]);

    const defaultValues = activities.reduce((acc, act) => {
        acc[act.id] = {
            status: act.status || null,
            notes: act.notes || "",
            evidenceLink: act.evidenceLink || "",
            type: act.type || ""
        };
        return acc;
    }, {})

    const form = useForm({ defaultValues })

    useEffect(() => {
        if (open && activities) {
            setLocalActivities(activities.map(a => ({ ...a })));
            const freshDefaults = activities.reduce((acc, act) => {
                acc[act.id] = {
                    status: act.status || null,
                    notes: act.notes || "",
                    evidenceLink: act.evidenceLink || "",
                    type: act.type || ""
                }
                return acc
            }, {})
            form.reset(freshDefaults)
        }
    }, [open])

    const formValues = form.watch();

    const handleChangeStatus = (id, value) => {
        form.setValue(id.toString(), value, { shouldDirty: true });
    };

    const handleAddCustomActivity = () => {
        const newId = `new-${Date.now()}`;
        setLocalActivities([...localActivities, {
            id: newId,
            type: "",
            isNew: true
        }]);
        form.setValue(newId, {
            status: null,
            notes: "",
            evidenceLink: "",
            type: ""
        });
    }

    const handleSubmit = async (values) => {
        try {
            setIsLoading(true);

            const payload = {
                activities: Object.entries(values).map(([id, item]) => ({
                    id: id.startsWith('new-') ? undefined : Number(id),
                    type: item.type || undefined,
                    status: item.status,
                    notes: item.notes,
                    evidenceLink: item.evidenceLink
                }))
            };

            await api.put(`/api/partnership/${partnershipId}`, payload,)

            toast.success("Status aktivitas berhasil diperbarui");
            setOpen(false);

            if (onSuccess) onSuccess();

        } catch (err) {
            console.error(err);
            toast.error("Gagal menyimpan status aktivitas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" variant="ghost">
                    <CheckCircle2 className="text-emerald-500" /> Edit Status Aktivitas
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-5xl w-full p-0 border-none shadow-none overflow-hidden dark:bg-transparent dark:bg-transparent">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-none dark:bg-slate-900 p-6 rounded-2xl h-[83vh] overflow-y-auto">
                            <div className="mx-auto">
                                <div className="dark:bg-slate-800 bg-white rounded-2xl shadow-xl p-8 mb-6 dark:border-slate-700 border border-slate-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-rose-800 to-red-400 rounded-xl flex items-center justify-center">
                                            <CheckCircleIcon className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-red-800 bg-clip-text text-transparent">
                                                Edit Status Aktivitas
                                            </h1>
                                            <DialogHeader>
                                                <DialogTitle>Kelola status setiap aktivitas Kerjasama</DialogTitle>
                                            </DialogHeader>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Section */}
                            <div className="dark:bg-slate-800 bg-white rounded-2xl shadow-xl p-8 mb-6 dark:border-slate-700 border border-slate-200">
                                {/* Cards */}
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-gradient-to-b from-rose-500 to-red-800 rounded-full"></div>
                                    Status Pelaksanaan
                                </h3>
                                <p className="mb-6">Kelola status setiap aktivitas Kerjasama</p>

                                <ProgressBarActivity activities={localActivities.map(act => ({
                                    ...act,
                                    status: formValues[act.id]?.status
                                }))} />

                                <div className="rounded-2xl p-2">
                                    {activities.length === 0 ? (
                                        <Empty className="from-muted/50 to-background h-64 bg-gradient-to-b from-30% flex items-center justify-center">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Dock className="size-8" />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    Kosongnya Ruang Lingkup Mitra
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    Tidak ada mitra yang dapat dikelola statusnya. Silakan ubah mitra kerjasama terlebih dahulu.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1 px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                                                    onClick={() => setOpen(false)}
                                                    disabled={isLoading}
                                                >
                                                    <FileOutputIcon className="size-4" />
                                                    Tutup
                                                </button>
                                            </EmptyContent>
                                        </Empty>
                                    ) : (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {localActivities.map((act) => (
                                                <ActivityCard
                                                    key={act.id}
                                                    activity={act}
                                                    value={formValues[act.id]}
                                                    onChange={(val) => handleChangeStatus(act.id, val)}
                                                />
                                            ))}
                                            
                                            <div className="border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center p-6 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={handleAddCustomActivity}>
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                        <PlusCircle className="w-6 h-6 text-slate-500" />
                                                    </div>
                                                    <p className="font-semibold text-slate-600 text-sm">Aktivitas Lainnya</p>
                                                    <p className="text-xs text-slate-400 mt-1">Tambahkan aktivitas manual</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6 justify-end">
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                                    onClick={() => setOpen(false)}
                                    disabled={isLoading}
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <LoaderIcon className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </div>
                                    ) : (
                                        "Simpan Perubahan"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}
