import { FormEventHandler, useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    users: UserItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
];

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'auditie', label: 'Auditie' },
];

const formatRole = (role: string | null) => {
    if (!role) return 'Auditor';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const formatStatus = (isActive: boolean) => (isActive ? 'Active' : 'Disabled');

const getRoleBadgeClass = (role: string | null) => {
    const normalized = role || 'auditor';
    if (normalized === 'admin') {
        return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
    }
    if (normalized === 'auditie') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200';
    }

    return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200';
};

const getStatusBadgeClass = (isActive: boolean) => {
    if (isActive) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200';
    }

    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200';
};

export default function Index({ users: initialUsers }: Props) {
    const [users, setUsers] = useState<UserItem[]>(initialUsers);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [statusId, setStatusId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'auditor',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/users', {
            preserveScroll: true,
            onSuccess: () => reset('name', 'email', 'password', 'role'),
        });
    };

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handleRoleChange = (userId: number, role: string) => {
        setSavingId(userId);
        setUsers((prev) => prev.map((user) => (
            user.id === userId ? { ...user, role } : user
        )));

        router.patch(`/users/${userId}`, { role }, {
            preserveScroll: true,
            onFinish: () => setSavingId(null),
        });
    };

    const handleStatusToggle = (userId: number) => {
        const target = users.find((user) => user.id === userId);
        if (!target) return;

        const nextStatus = !target.is_active;
        setStatusId(userId);
        setUsers((prev) => prev.map((user) => (
            user.id === userId ? { ...user, is_active: nextStatus } : user
        )));

        router.patch(`/users/${userId}`, { is_active: nextStatus }, {
            preserveScroll: true,
            onFinish: () => setStatusId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        User Management
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage user roles (Admin, Auditor & Auditie).
                    </p>
                </div>

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        <form
                            onSubmit={submit}
                            className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-neutral-900/40"
                        >
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="Full name"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(event) => setData('password', event.target.value)}
                                        placeholder="Minimum 6 characters"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <div className="relative">
                                        <select
                                            id="role"
                                            value={data.role}
                                            onChange={(event) => setData('role', event.target.value)}
                                            disabled={processing}
                                            className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100"
                                        >
                                            {ROLE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {errors.role && (
                                        <p className="text-sm text-red-600">{errors.role}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Add User'}
                                </Button>
                            </div>
                        </form>

                        {users.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No users found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-neutral-800 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <label
                                                htmlFor={`role-${user.id}`}
                                                className="text-sm text-gray-600 dark:text-gray-400"
                                            >
                                                Role
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id={`role-${user.id}`}
                                                    value={user.role || 'auditor'}
                                                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                                                    disabled={savingId === user.id}
                                                    className="h-10 min-w-[150px] appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100"
                                                >
                                                    {ROLE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            </div>
                                            {savingId === user.id ? (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Saving...
                                                </span>
                                            ) : (
                                                <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                                                    {formatRole(user.role)}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className={getStatusBadgeClass(user.is_active)}>
                                                {formatStatus(user.is_active)}
                                            </Badge>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={user.is_active ? 'outline' : 'secondary'}
                                                onClick={() => handleStatusToggle(user.id)}
                                                disabled={statusId === user.id}
                                                className={user.is_active ? 'border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-200' : ''}
                                            >
                                                {statusId === user.id
                                                    ? 'Updating...'
                                                    : user.is_active
                                                        ? 'Disable'
                                                        : 'Enable'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
