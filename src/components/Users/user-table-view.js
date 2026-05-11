'use client'

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Lock, Edit2 } from 'lucide-react';
import DeleteUser from './delete-user';

const UserTableView = ({ 
    users, 
    roleConfig, 
    isLoading, 
    setIsLoading, 
    fetchUsers, 
    setSelectedUser 
}) => {
    return (
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/40 hover:bg-transparent">
                            <TableHead>Nama</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Tanggal Terdaftar</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/20 transition-colors hidden sm:block">
                                            <Lock className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="group-hover:text-primary transition-colors">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 bg-secondary/30 w-fit px-2 py-0.5 rounded-md text-sm text-muted-foreground">
                                        <Lock className="w-3 h-3" />
                                        <span className="font-medium">{user.username}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm flex items-center gap-1.5 w-fit ${roleConfig[user.role]?.color || roleConfig['kaur'].color}`}>
                                        <span>{roleConfig[user.role]?.icon}</span> {roleConfig[user.role]?.label || user.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 items-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-9 font-semibold"
                                            onClick={() => setSelectedUser(user)}
                                            title="Ubah Profile"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Ubah
                                        </Button>
                                        <div className="w-24">
                                            <DeleteUser
                                                isLoading={isLoading}
                                                setIsLoading={setIsLoading}
                                                userId={user.id}
                                                onSuccess={fetchUsers}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

export default UserTableView;
