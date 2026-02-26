'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlarmClock, AlarmClockIcon, CalendarIcon, GalleryVertical, GalleryVerticalEnd, Loader2, LoaderCircle, Mail, MoreHorizontal, PencilLine, PlusCircle, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { compareAsc, format, isSameDay } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteSchedule from "@/components/Scheduler/delete-schedule";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { RecipientsMultiSelect } from "@/components/Scheduler/recipient-multi-select";
import api from "@/lib/axios";

export const scheduleSchema = z.object({
    eventTitle: z.string().min(1, "Judul kegiatan wajib diisi"),
    recipients: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            phoneNumber: z.string(),
        })
    ).min(1, { message: "Minimal satu penerima harus dipilih" }),
    eventDescription: z.string().min(1, "Deskripsi kegiatan wajib diisi"),
    eventDate: z.date({ required_error: "Tanggal kegiatan wajib dipilih." }),
    time: z.string(),
    reminderDate: z.date({ required_error: "Tanggal reminder wajib dipilih." }),
    reminderTime: z.string()
})


function hasEventsOnDate(schedule, date) {
    return schedule.some((ev) => isSameDay(ev.reminderTime, date))
}

function formatHumanDate(date) {
    return format(date, "d MMMM yyyy", { locale: localeId })
}

const handleDeleteSuccess = (deletedScheduleId) => {
    // Hapus schedule dari state tanpa perlu reload
    setSchedules(prevSchedules =>
        prevSchedules.filter(schedule => schedule.id !== deletedScheduleId)
    )
}

function EventRow({ event, onViewDetail, onCancel, isLoading, scheduleEvents }) {
    return (
        <div className={cn("flex items-start justify-between gap-4 py-3", "first:pt-0 last:pb-0")}>
            <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm text-muted-foreground">Akan dikirim pada: {format(event.reminderTime, "HH:mm")}</div>
                <div className="truncate font-medium">{event.eventTitle}</div>
                <div className="text-pretty text-sm text-muted-foreground">{event.eventDescription}</div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Badge className="capitalize" variant={event.status === "sent" ? "default" : "secondary"}>{event.status}</Badge>
                {event.status === "pending" ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Opsi">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                            <DropdownMenuItem disabled><GalleryVerticalEnd className="size-4 mr-2" /> Detail</DropdownMenuItem>
                            <DropdownMenuItem disabled><PencilLine className="size-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCancel(event.id)} className="text-destructive">
                                {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <X className="text-destructive size-4 mr-2" />} Batalkan
                            </DropdownMenuItem>
                            <DeleteSchedule event={event} onDeleteSuccess={handleDeleteSuccess} scheduleEvents={scheduleEvents} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <DeleteSchedule event={event} onDeleteSuccess={handleDeleteSuccess} scheduleEvents={scheduleEvents} />
                )}
            </div>
        </div>
    )
}

const ReminderPage = () => {
    const [open, setOpen] = useState(false)
    const [schedules, setSchedules] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [contacts, setContacts] = useState([])

    const scheduleEvents = async () => {
        const res = await api.get(`/api/schedules`)
        const data = res.data
        if (Array.isArray(data)) {
            setSchedules(data)
        } else {
            console.warn("Unexpected API response:", data)
            setSchedules([])
        }
    }

    const createSchedule = async (values) => {
        setIsLoading(true)

        try {
            // Parse waktu dari form values
            const [eventHours, eventMinutes] = values.time.split(':').map(Number)
            const combinedEventDateTime = new Date(values.eventDate)
            combinedEventDateTime.setHours(eventHours, eventMinutes, 0, 0)

            const [reminderHours, reminderMinutes] = values.reminderTime.split(':').map(Number)
            const combinedReminderDateTime = new Date(values.reminderDate)
            combinedReminderDateTime.setHours(reminderHours, reminderMinutes, 0, 0)

            // Format recipients untuk API
            const formattedRecipients = values.recipients.map((r) => ({ id: r.id }))

            const res = await api.post(`/api/schedules`, {
                eventTitle: values.eventTitle,
                eventDescription: values.eventDescription,
                eventTime: combinedEventDateTime,
                reminderTime: combinedReminderDateTime,
                createdBy: '6282318572605@c.us',
                recipients: formattedRecipients
            }, {
                headers: {
                    "ngrok-skip-browser-warning": true,
                },
            })

            if (res.status === 201) {
                await new Promise(resolve => setTimeout(resolve, 1500))
                toast.success(`Jadwal pengingat sukses dibuat`, {
                    description: `Yang akan dikirimkan pada ${format(combinedReminderDateTime, "HH:mm")}`
                })
                form.reset()
            }
        } catch (error) {
            console.error("Gagal membuat jadwal:", error)
            toast.error("Gagal membuat pengingat, jangan sungkan untuk mencobanya lagi")
        } finally {
            setIsLoading(false)
            setOpen(false)
            scheduleEvents()
        }
    }

    const handleCancelSchedule = async (scheduleId) => {
        setIsLoading(true)
        try {
            const res = await api.put(`/api/schedules/${scheduleId}/cancel`, {
                status: 'cancelled'
            })
            if (res.status === 200) {
                await new Promise(resolve => setTimeout(resolve, 3000))
                toast.success("Jadwal pengingat ini telah dibatalkan")
            }
        } catch (error) {
            console.error("Gagal membuat jadwal:", error)
            toast.error("Gagal membatalkan pengingat, silahkan dicoba lagi")
        } finally {
            setIsLoading(false)
            scheduleEvents()
        }
    }

    const fetchContacts = async () => {
        try {
            const res = await api.get(`/api/contacts`)
            setContacts(res.data)
        } catch (error) {
            console.error("Gagal mengambil kontak:", error)
            toast.error("Gagal memuat daftar kontak")
        }
    }

    useEffect(() => {
        scheduleEvents()
        setIsMounted(true)
        fetchContacts()
    }, [])

    const eventsForDay = useMemo(() => {
        return schedules
            .filter((ev) => isSameDay(ev.reminderTime, selectedDate))
            .sort((a, b) => compareAsc(a.reminderTime, b.reminderTime))
    }, [schedules, selectedDate])

    function handleViewDetail(ev) {
        setSelectedEvent(ev)
        setIsDrawerOpen(true)
    }

    const form = useForm({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            eventTitle: "",
            // recipients: [{ name: "", phoneNumber: "" }],
            recipients: [],
            eventDate: new Date(),
            time: "09:00",
            reminderDate: new Date(),
            reminderTime: "08:00",
        }
    })

    // const { fields, append, remove } = useFieldArray({
    //     control: form.control,
    //     name: 'recipients'
    // })

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start mt-1 gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                        <AlarmClock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-red-500">Reminder Ibu Dekan</h1>
                        <p className="text-muted-foreground">
                            Pengingat kegiatan penting agar tidak terlewat
                        </p>
                    </div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto"><PlusCircle /> Buat Jadwal Baru</Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Buat Reminder Baru</DialogTitle>
                        </DialogHeader>

                        <Form {...form}>
                            <form id="schedule-form" onSubmit={form.handleSubmit(createSchedule)} className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1 space-y-2">
                                <FormField
                                    control={form.control}
                                    name="eventTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Judul kegiatan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama kegiatan yang akan dihadiri" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="recipients"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Penerima Pengingat</FormLabel>
                                            <FormControl>
                                                <RecipientsMultiSelect
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    contacts={contacts}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            {/* <FormMessage /> */}
                                        </FormItem>
                                    )}
                                />

                                {/* <div className="flex justify-center">
                                    <Button type="button" className="text-white"
                                        onClick={() => append({ name: "", phoneNumber: "" })}
                                    >Tambah penerima</Button>
                                </div> */}

                                <FormField
                                    control={form.control}
                                    name={`eventDescription`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Isi pesan reminder</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tulis pesan pengingat di sini..."
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* --- WAKTU KEGIATAN (Event Time) --- */}
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`eventDate`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-xs">Tanggal kegiatan</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className={cn("w-full justify-start text-left font-semibold", !field.value && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(field.value, "PPP") : <span>Pilih tanggal kegiatan</span>}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={{ before: new Date() }} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`time`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Jam kegiatan</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Waktu Reminder */}
                                <div className="grid grid-cols-2  gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`reminderDate`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-xs">Tanggal pengiriman reminder</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant="outline" className={cn("w-full justify-start text-left font-semibold", !field.value && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(field.value, "PPP") : <span>Pilih tanggal reminder</span>}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={{ before: new Date() }} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`reminderTime`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Jam pengiriman reminder</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </form>
                        </Form>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" form="schedule-form" disabled={isLoading}>
                                {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : "Simpan jadwal"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Two panel Layout */}
            <section className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel: calender */}
                <div className="flex-1 flex justify-center h-[80%]">
                    {isMounted ? (
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => d && setSelectedDate(d)}
                            className="rounded-md border shadow-sm w-full max-w-md xl:max-w-xl h-full"
                            modifiers={{
                                busy: (date) => hasEventsOnDate(schedules, date),
                            }}
                            modifiersClassNames={{
                                busy: `after:content-[''] after:block after:mx-auto after:-mt-3
                                 after:h-1.5 after:w-1.5 after:rounded-full after:bg-red-600`,
                            }}
                        />
                    ) : (
                        <div className="rounded-md border shadow-sm w-full max-w-md h-[350px] flex items-center justify-center">
                            <div className="text-muted-foreground">Loading calendar...</div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Event Details */}
                <div className="flex-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jadwal pengingat untuk {formatHumanDate(selectedDate)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {eventsForDay.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Tidak ada jadwal untuk tanggal ini.</p>
                            ) : (
                                <div className="divide-y">
                                    {eventsForDay.map((event) => (
                                        <EventRow scheduleEvents={scheduleEvents} key={event.id} event={event} onViewDetail={handleViewDetail} onCancel={handleCancelSchedule} isLoading={isLoading} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

export default ReminderPage;