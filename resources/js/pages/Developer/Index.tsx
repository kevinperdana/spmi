import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DeveloperCommand {
    key: string;
    command: string;
    description: string;
    buttonLabel: string;
}

interface CommandResult {
    success: boolean;
    message: string;
    output: string;
    exitCode: number | null;
    ranAt: string;
}

interface CommandResponse {
    success?: boolean;
    message?: string;
    output?: string;
    exitCode?: number;
}

interface Props {
    commands: DeveloperCommand[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Developer', href: '/developer' },
];

const getCsrfToken = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') || '';

export default function Index({ commands }: Props) {
    const [openCommand, setOpenCommand] = useState<string | null>(
        commands[0]?.key ?? null,
    );
    const [runningCommand, setRunningCommand] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, CommandResult>>({});

    const handleRunCommand = async (commandKey: string) => {
        setOpenCommand(commandKey);
        setRunningCommand(commandKey);

        try {
            const response = await fetch('/developer/commands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ command: commandKey }),
            });

            const payload = (await response
                .json()
                .catch(() => null)) as CommandResponse | null;
            const success = response.ok && Boolean(payload?.success);

            setResults((prev) => ({
                ...prev,
                [commandKey]: {
                    success,
                    message:
                        payload?.message ||
                        (success
                            ? 'Perintah berhasil dijalankan.'
                            : 'Perintah gagal dijalankan.'),
                    output: payload?.output || '',
                    exitCode:
                        typeof payload?.exitCode === 'number'
                            ? payload.exitCode
                            : null,
                    ranAt: new Date().toLocaleString('id-ID'),
                },
            }));
        } catch {
            setResults((prev) => ({
                ...prev,
                [commandKey]: {
                    success: false,
                    message:
                        'Tidak bisa terhubung ke server saat menjalankan perintah.',
                    output: '',
                    exitCode: null,
                    ranAt: new Date().toLocaleString('id-ID'),
                },
            }));
        } finally {
            setRunningCommand(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Developer" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 [&_[data-slot=button]]:shadow-none [&_[data-slot=input]]:shadow-none [&_[data-slot=textarea]]:shadow-none [&_button:not(:disabled)]:cursor-pointer">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Developer
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Gunakan perintah ini untuk tugas maintenance
                            aplikasi.
                        </p>
                    </div>
                </div>

                <div className="w-full rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="space-y-4">
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200">
                            Gunakan hanya saat diperlukan.
                        </div>

                        <div className="space-y-3">
                            {commands.map((command) => {
                                const isOpen = openCommand === command.key;
                                const isRunning =
                                    runningCommand === command.key;
                                const result = results[command.key];

                                return (
                                    <div
                                        key={command.key}
                                        className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-neutral-900/40"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenCommand((prev) =>
                                                    prev === command.key
                                                        ? null
                                                        : command.key,
                                                )
                                            }
                                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {command.command}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {command.description}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="space-y-3 border-t border-gray-200 px-4 py-4 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        type="button"
                                                        disabled={
                                                            runningCommand !==
                                                            null
                                                        }
                                                        onClick={() =>
                                                            handleRunCommand(
                                                                command.key,
                                                            )
                                                        }
                                                    >
                                                        {isRunning
                                                            ? 'Menjalankan...'
                                                            : command.buttonLabel}
                                                    </Button>
                                                </div>

                                                {result && (
                                                    <div
                                                        className={`rounded-md border px-3 py-2 text-sm ${
                                                            result.success
                                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'
                                                                : 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200'
                                                        }`}
                                                    >
                                                        <p className="font-medium">
                                                            {result.message}
                                                        </p>
                                                        <p className="mt-1 text-xs opacity-80">
                                                            {result.exitCode !==
                                                            null
                                                                ? `Exit code: ${result.exitCode}`
                                                                : 'Exit code: -'}{' '}
                                                            • {result.ranAt}
                                                        </p>
                                                    </div>
                                                )}

                                                {result?.output && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-neutral-900">
                                                        <p className="mb-2 text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-300">
                                                            Output
                                                        </p>
                                                        <pre className="text-xs break-words whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                                                            {result.output}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
