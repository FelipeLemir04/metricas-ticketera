import PaginaSimpleLayout from '@/Layouts/PaginaSimpleLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const claseCampo = 'block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500';

function FilaEquipo({ equipo }) {
    const [editando, setEditando] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({ nombre: equipo.nombre });

    const guardar = (e) => {
        e.preventDefault();
        put(`/admin/equipos/${equipo.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditando(false),
        });
    };

    const cancelar = () => {
        reset();
        setEditando(false);
    };

    const sinNombre = equipo.nombre === `Ticketera ${equipo.id}`;

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td className="px-5 py-3 whitespace-nowrap font-semibold tabular-nums text-slate-500 dark:text-slate-400">{equipo.id}</td>
            <td className="px-5 py-3 w-full">
                {editando ? (
                    <form onSubmit={guardar} className="flex flex-wrap items-center gap-2">
                        <input
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            className={`${claseCampo} max-w-sm`}
                            autoFocus
                        />
                        <button type="submit" disabled={processing} className="rounded-lg bg-[#002b49] dark:bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#003b63] dark:hover:bg-blue-500 disabled:opacity-60">
                            Guardar
                        </button>
                        <button type="button" onClick={cancelar} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            Cancelar
                        </button>
                        {errors.nombre && <p className="w-full text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>}
                    </form>
                ) : (
                    <span className={sinNombre ? 'italic text-slate-400 dark:text-slate-500' : 'font-medium text-slate-900 dark:text-white'}>
                        {equipo.nombre}
                    </span>
                )}
            </td>
            <td className="px-5 py-3 whitespace-nowrap text-right">
                {!editando && (
                    <button onClick={() => setEditando(true)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800">
                        Renombrar
                    </button>
                )}
            </td>
        </tr>
    );
}

export default function Equipos({ equipos }) {
    const { flash } = usePage().props;

    return (
        <PaginaSimpleLayout>
            <Head title="Equipos" />

            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">Administración</p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Equipos</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Cada equipo es una de las ticketeras del hospital que atiende tickets. La ticketera no guarda sus nombres,
                    así que se definen aquí y se usan en el dashboard y al asignar jefes.
                </p>
            </div>

            {flash.mensaje && (
                <div className="rounded-xl bg-green-50 dark:bg-green-500/10 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400">
                    {flash.mensaje}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">ID</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nombre</th>
                            <th className="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {equipos.map(equipo => <FilaEquipo key={equipo.id} equipo={equipo} />)}
                    </tbody>
                </table>
            </section>
        </PaginaSimpleLayout>
    );
}
