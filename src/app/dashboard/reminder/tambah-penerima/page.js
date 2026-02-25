'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Contact, Contact2, LoaderIcon, PlusCircleIcon, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ContactTable from '@/components/Contact/contact-table';
import api from '@/lib/axios';

export const contactSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phoneNumber: z.string()
    .min(9, "Nomor tujuan terlalu pendek")
    .max(15, "Nomor whatsapp terlalu panjang")
    .regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh berisi angka.")
    .refine(value => !value.startsWith("62"), {
      message: "Nomor WhatsApp tidak boleh diawali dengan 62."
    }),
  notes: z.string().min(1, "Catatan wajib diisi"),
})

function TambahPenerimaPage() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState([])

  const getContacts = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/api/contacts`)
      const data = res.data
      if (Array.isArray(data)) {
        setContacts(data)
      } else {
        console.warn("Unexpected API response:", data)
        setContacts([])
      }
    } catch (err) {
      console.error("Gagal fetch contacts:", err)
      setContacts([])
    }
    finally {
      setIsLoading(false)
    }
  }


  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      notes: "",
      title: ""
    }
  })

  const createContact = async (values) => {
    const formattedPhoneNumber = `62${values.phoneNumber.replace(/^0+/, '')}@c.us`

    try {
      setIsLoading(true)
      const res = await api.post(`/api/contacts`, {
        name: values.name,
        phoneNumber: formattedPhoneNumber,
        notes: values.notes,
        title: values.title
      }, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      })
      const data = res.data
      if (res.status === 201 || data.id) {
        getContacts()
        form.reset()
        setOpen(false)
        toast.success("Kontak berhasil ditambahkan", {
          style: { background: "#059669", color: "#d1fae5" },
          className: "border border-emerald-500"
        })
      } else {
        toast.error("Kontak gagal ditambahkan", {
          style: { background: "#fee2e2", color: "#991b1b" },
          className: "border border-red-500"
        })
      }
    } catch (error) {
      console.log("Error creating contact:", error)
      if (error.response?.data?.message?.includes("Unique constraint failed on the fields: (`phone_number`)")) {
        toast.error("Kontak dengan nomor telepon ini sudah ada.", {
          style: { background: "#fee2e2", color: "#991b1b" },
          className: "border border-red-500"
        })
      } else {
        toast.error(error.response?.data?.message || "Kontak gagal ditambahkan", {
          style: { background: "#fee2e2", color: "#991b1b" },
          className: "border border-red-500"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getContacts()
  }, [])

  return (
    <section className='space-y-6'>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-sm:flex-col sm:flex-col lg:flex-row items-start mt-1 gap-3">
          <div>
            <div className='flex items-center gap-2'>
              <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-red-600">Kumpulan Penerima Reminder</h1>
            </div>
            <p className="text-muted-foreground">
              Daftar penerima reminder yang telah ditambahkan
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <div className='relative flex gap-2'>
            {/* <Input className="w-full" placeholder="Cari kontak penerima" /> */}
            <DialogTrigger asChild>
              <Button className=" sm:w-auto"><PlusCircleIcon /> Tambah kontak</Button>
            </DialogTrigger>
          </div>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat kontak penerima reminder</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form id="contact-form" onSubmit={form.handleSubmit(createContact)} className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1 space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama kontak</FormLabel>
                      <FormControl>
                        <Input placeholder="Cth: Royal Ignatius" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="81234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan</FormLabel>
                      <FormControl>
                        <Input placeholder="Dosen S1 Adbis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" form="contact-form" disabled={isLoading}>
                {isLoading ?
                  <div className="flex justify-center items-center text-center gap-2 ">
                    <LoaderIcon className="animate-spin size-4" /> <span>Menambahkan kontak...</span>
                  </div>
                  : "Tambahkan kontak"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ContactTable contacts={contacts} isLoading={isLoading} setIsLoading={setIsLoading} getContacts={getContacts} />
    </section>
  )
}

export default TambahPenerimaPage