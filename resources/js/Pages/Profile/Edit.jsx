import PaginaSimpleLayout from '@/Layouts/PaginaSimpleLayout';
import { Head, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit() {
    const { auth } = usePage().props;

    return (
        <PaginaSimpleLayout>
            <Head title="Mi cuenta" />

            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">Mi cuenta</p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{auth.user.name}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{auth.user.email}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
                <UpdatePasswordForm className="max-w-md" />
            </div>
        </PaginaSimpleLayout>
    );
}
