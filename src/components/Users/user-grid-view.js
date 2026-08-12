'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Edit2, Fingerprint, AlertTriangle } from 'lucide-react';
import DeleteUser from './delete-user';

const UserGridView = ({ 
    users, 
    roleConfig, 
    isLoading, 
    setIsLoading, 
    fetchUsers, 
    setSelectedUser 
}) => {
    // User SSO = punya email @telkomuniversity tapi password null, atau isSsoMapped ada
    const isSsoUser = (user) => user.password === null && (user.email?.endsWith('@telkomuniversity.ac.id') || user.isSsoMapped !== undefined);
    const isUnmappedSso = (user) => isSsoUser(user) && user.isSsoMapped === false;

    return (
        <div className="grid gap-4">
            {users.map((user) => (
                <Card key={user.id} className={`border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg group ${isUnmappedSso(user) ? 'border-amber-500/30' : ''}`}>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex items-start gap-5 flex-1">
                                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/20 transition-colors h-fit">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{user.name}</h3>
                                        {/* Badge SSO */}
                                        {isSsoUser(user) && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                                user.isSsoMapped
                                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {user.isSsoMapped ? (
                                                    <><Fingerprint className="w-3 h-3" /> SSO</>
                                                ) : (
                                                    <><AlertTriangle className="w-3 h-3" /> Belum Dipetakan</>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2 bg-secondary/30 px-2 py-0.5 rounded-md">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span className="truncate font-medium">{user.username}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 hidden sm:block" />
                                            <span>Terdaftar: {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className={`px-4 py-1 rounded-lg text-xs font-bold border shadow-sm ${roleConfig[user.role]?.color || roleConfig['kaur'].color}`}>
                                            {roleConfig[user.role]?.icon} {roleConfig[user.role]?.label || user.role}
                                        </span>
                                    </div>
                                    {/* Warning pesan untuk user SSO belum dipetakan */}
                                    {isUnmappedSso(user) && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                            <AlertTriangle className="w-3 h-3 shrink-0" />
                                            <span>Akun SSO ini login dengan role default. Klik <strong>Ubah Profile</strong> untuk menetapkan role yang sesuai.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 sm:flex-col sm:min-w-32">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2 flex-1 sm:flex-none h-10 font-semibold"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Ubah Profile
                                </Button>
                                <DeleteUser
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading}
                                    userId={user.id}
                                    onSuccess={fetchUsers}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default UserGridView;
