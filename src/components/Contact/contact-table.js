'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "../ui/button";
import { Ellipsis } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import DeleteContact from "../Contact/delete-contact";
import EditContact from "../Contact/edit-contact";

const ContactTable = ({ contacts, isLoading, setIsLoading, getContacts }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const d = new Date(dateString)
        if (isNaN(d)) return '-'
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <div className="md:overflow-x-auto xl:w-full">
                <Table className="">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[160px]">Nama penerima</TableHead>
                            <TableHead className="sm:min-w-[120px] lg:min-w-[260px]">No tlp</TableHead>
                            <TableHead className="max-sm:hidden sm:min-w-[120px] lg:min-w-[300px]">Catatan</TableHead>
                            <TableHead className="max-sm:hidden min-w-[120px] sm:hidden xl:table-cell">Kontak dibuat pada</TableHead>
                            <TableHead className="max-sm:hidden min-w-[120px] sm:hidden xl:table-cell">Diubah pada</TableHead>
                            <TableHead className="min-w-[80px] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact, i) => (
                            <TableRow key={contact.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{contact.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">+{contact.phoneNumber}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="flex flex-col max-sm:hidden">
                                    <p className="text-pretty">{contact.notes}</p>
                                </TableCell>
                                <TableCell className="max-sm:hidden sm:hidden xl:table-cell">
                                    <div className="flex flex-col">
                                        <span className="">{formatDate(contact.createdAt)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="flex flex-col max-sm:hidden sm:hidden xl:table-cell">
                                    <span className="">{formatDate(contact.updatedAt)}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost">
                                                <Ellipsis />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-4/5">
                                            <DropdownMenuLabel className="text-left font-bold">Edit / Hapus Kontak</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <EditContact getContacts={getContacts} contact={contact} />
                                            <DeleteContact getContacts={getContacts} contactId={contact.id} isLoading={isLoading} setIsLoading={setIsLoading} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {contacts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    Buku kontak masih kosong nih.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default ContactTable;