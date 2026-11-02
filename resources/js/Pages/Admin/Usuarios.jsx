import Modal from '@/Components/Modal';
import PaginaSimpleLayout from '@/Layouts/PaginaSimpleLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const claseCampo = 'block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500';
const claseEtiqueta = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const claseBotonPrimario = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#002b49] dark:bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#003b63] dark:hover:bg-blue-500 disabled:opacity-60 transition-colors';
const claseBotonSecundario = 'inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors';
const claseBotonIcono = 'rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors';

const ICONOS = {
    mas: 'M12 4.5v15m7.5-7.5h-15',
    lapiz: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
    llave: 'M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z',
    basura: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
    buscar: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
    cerrar: 'M6 18 18 6M6 6l12 12',
    check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

function Icono({ nombre, className = 'w-5 h-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className={className} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONOS[nombre]} />
        </svg>
    );
}

function Error({ mensaje }) {
    return mensaje ? <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{mensaje}</p> : null;
}

// --- AVISO CON LA CONTRASEÑA TEMPORAL (se muestra una sola vez) ---
function AvisoPasswordTemporal({ datos }) {
    const [oculto, setOculto] = useState(false);

    if (!datos || oculto) return null;

    return (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        {datos.motivo === 'creado' ? 'Usuario creado' : 'Contraseña restablecida'}: {datos.email}
                    </p>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-300/80">
                        Entrega esta contraseña temporal al usuario. No se volverá a mostrar; podrá cambiarla en "Cambiar contraseña".
                    </p>
                </div>
                <button onClick={() => setOculto(true)} className="text-amber-700 dark:text-amber-300 hover:opacity-70" aria-label="Cerrar aviso">
                    <Icono nombre="cerrar" className="w-4 h-4" />
                </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <code className="rounded-lg bg-white dark:bg-slate-900 px-4 py-2 font-mono text-lg font-semibold tracking-wider text-slate-900 dark:text-white ring-1 ring-amber-200 dark:ring-amber-500/30">
                    {datos.password}
                </code>
            </div>
        </div>
    );
}

// --- SELECTOR DE EQUIPOS CON BÚSQUEDA ---
function SelectorEquipos({ equipos, seleccionados, onChange }) {
    const [busqueda, setBusqueda] = useState('');

    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return texto === '' ? equipos : equipos.filter(d => d.nombre.toLowerCase().includes(texto));
    }, [busqueda, equipos]);

    const alternar = (id) => {
        onChange(seleccionados.includes(id) ? seleccionados.filter(s => s !== id) : [...seleccionados, id]);
    };

    return (
        <div className="rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
            <div className="relative border-b border-slate-200 dark:border-slate-700">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Icono nombre="buscar" className="w-4 h-4" />
                </span>
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar equipo…"
                    className="block w-full border-0 bg-transparent py-2.5 pl-9 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0"
                />
            </div>
            <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filtrados.map(d => (
                    <li key={d.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <input
                                type="checkbox"
                                checked={seleccionados.includes(d.id)}
                                onChange={() => alternar(d.id)}
                                className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-700 dark:text-slate-200">{d.nombre}</span>
                        </label>
                    </li>
                ))}
                {filtrados.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Sin resultados.</li>
                )}
            </ul>
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                {seleccionados.length} seleccionado{seleccionados.length === 1 ? '' : 's'}
            </div>
        </div>
    );
}

// --- FORMULARIO CREAR / EDITAR ---
function FormularioUsuario({ usuario, equipos, roles, onCerrar }) {
    const esEdicion = Boolean(usuario);
    const { data, setData, post, put, processing, errors } = useForm({
        name: usuario?.name ?? '',
        email: usuario?.email ?? '',
        rol: usuario?.rol ?? 'jefe',
        equipo_ids: usuario?.equipo_ids ?? [],
        activo: usuario?.activo ?? true,
    });

    const enviar = (e) => {
        e.preventDefault();
        const opciones = { preserveScroll: true, onSuccess: onCerrar };

        if (esEdicion) {
            put(`/admin/usuarios/${usuario.id}`, opciones);
        } else {
            post('/admin/usuarios', opciones);
        }
    };

    return (
        <form onSubmit={enviar}>
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h2>
                {!esEdicion && (
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Se generará una contraseña temporal para entregarle.</p>
                )}
            </div>

            <div className="space-y-5 px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={claseEtiqueta}>Nombre completo</label>
                        <input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className={claseCampo} autoFocus />
                        <Error mensaje={errors.name} />
                    </div>
                    <div>
                        <label htmlFor="email" className={claseEtiqueta}>Correo electrónico</label>
                        <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={claseCampo} />
                        <Error mensaje={errors.email} />
                    </div>
                </div>

                <div>
                    <span className={claseEtiqueta}>Rol</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roles.map(rol => (
                            <label
                                key={rol.valor}
                                className={`flex cursor-pointer flex-col rounded-xl border p-3 transition-colors ${data.rol === rol.valor
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500'
                                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <input type="radio" name="rol" value={rol.valor} checked={data.rol === rol.valor} onChange={() => setData('rol', rol.valor)} className="sr-only" />
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{rol.etiqueta}</span>
                                <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {rol.valor === 'admin' ? 'Solo administra usuarios. No ve gráficos ni tickets.' : 'Ve los gráficos y tickets que atienden sus equipos.'}
                                </span>
                            </label>
                        ))}
                    </div>
                    <Error mensaje={errors.rol} />
                </div>

                {data.rol === 'jefe' && (
                    <div>
                        <span className={claseEtiqueta}>Equipos a cargo</span>
                        <SelectorEquipos
                            equipos={equipos}
                            seleccionados={data.equipo_ids}
                            onChange={(ids) => setData('equipo_ids', ids)}
                        />
                        <Error mensaje={errors.equipo_ids || errors['equipo_ids.0']} />
                    </div>
                )}

                {esEdicion && (
                    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                        <span>
                            <span className="block text-sm font-medium text-slate-900 dark:text-white">Cuenta activa</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">Si la desactivas, el usuario no podrá iniciar sesión.</span>
                        </span>
                        <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                        />
                    </label>
                )}
                <Error mensaje={errors.activo} />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 py-4">
                <button type="button" onClick={onCerrar} className={claseBotonSecundario}>Cancelar</button>
                <button type="submit" disabled={processing} className={claseBotonPrimario}>
                    {processing ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
                </button>
            </div>
        </form>
    );
}

// --- CONFIRMACIÓN (eliminar / restablecer contraseña) ---
function Confirmacion({ accion, onCerrar }) {
    const [procesando, setProcesando] = useState(false);

    if (!accion) return null;

    const confirmar = () => {
        const opciones = {
            preserveScroll: true,
            onStart: () => setProcesando(true),
            onFinish: () => { setProcesando(false); onCerrar(); },
        };

        if (accion.tipo === 'eliminar') {
            router.delete(`/admin/usuarios/${accion.usuario.id}`, opciones);
        } else {
            router.post(`/admin/usuarios/${accion.usuario.id}/restablecer-password`, {}, opciones);
        }
    };

    const esEliminar = accion.tipo === 'eliminar';

    return (
        <div className="px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {esEliminar ? '¿Eliminar este usuario?' : '¿Restablecer la contraseña?'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {esEliminar
                    ? <>Se eliminará la cuenta de <strong>{accion.usuario.email}</strong> y ya no podrá acceder. Si solo quieres bloquear su acceso temporalmente, desactívala desde "Editar".</>
                    : <>Se generará una nueva contraseña temporal para <strong>{accion.usuario.email}</strong>. La actual dejará de funcionar.</>}
            </p>
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onCerrar} className={claseBotonSecundario}>Cancelar</button>
                <button
                    type="button"
                    onClick={confirmar}
                    disabled={procesando}
                    className={esEliminar
                        ? 'inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition-colors'
                        : claseBotonPrimario}
                >
                    {esEliminar ? 'Eliminar' : 'Restablecer'}
                </button>
            </div>
        </div>
    );
}

export default function Usuarios({ usuarios, equipos, roles }) {
    const { auth, flash } = usePage().props;
    const [formulario, setFormulario] = useState(null); // null | { usuario: null | {...} }
    const [accion, setAccion] = useState(null); // null | { tipo, usuario }
    const [busqueda, setBusqueda] = useState('');

    const nombrePorId = useMemo(() => Object.fromEntries(equipos.map(d => [d.id, d.nombre])), [equipos]);
    const etiquetaRol = useMemo(() => Object.fromEntries(roles.map(r => [r.valor, r.etiqueta])), [roles]);

    const usuariosFiltrados = usuarios.filter(u => {
        const texto = busqueda.trim().toLowerCase();
        if (texto === '') return true;
        const nombresEquipos = (u.equipo_ids ?? []).map(id => nombrePorId[id] ?? '').join(' ');
        return `${u.name} ${u.email} ${nombresEquipos}`.toLowerCase().includes(texto);
    });

    return (
        <PaginaSimpleLayout ancho="max-w-6xl">
            <Head title="Usuarios del panel" />

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">Administración</p>
                    <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Usuarios del panel</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Crea cuentas para los jefes de área y asígnales los equipos cuyos tickets pueden ver.</p>
                </div>
                <button onClick={() => setFormulario({ usuario: null })} className={claseBotonPrimario}>
                    <Icono nombre="mas" className="w-4 h-4" /> Nuevo usuario
                </button>
            </div>

            <AvisoPasswordTemporal key={flash.passwordTemporal?.password} datos={flash.passwordTemporal} />

            {flash.mensaje && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-500/10 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400">
                    <Icono nombre="check" className="w-5 h-5" /> {flash.mensaje}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-3">
                    <div className="relative w-full sm:w-72">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                            <Icono nombre="buscar" className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, correo o equipo"
                            className={`${claseCampo} pl-9`}
                        />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{usuariosFiltrados.length} de {usuarios.length} usuarios</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60">
                            <tr>
                                {['Usuario', 'Rol', 'Equipos', 'Estado', ''].map((columna, i) => (
                                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">{columna}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {usuariosFiltrados.map(u => {
                                const nombresEquipos = (u.equipo_ids ?? []).map(id => nombrePorId[id] ?? `#${id}`);
                                const esYo = u.id === auth.user.id;
                                return (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-sm font-bold text-blue-700 dark:text-sky-300">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {u.name} {esYo && <span className="ml-1 text-xs font-normal text-slate-400">(tú)</span>}
                                                    </p>
                                                    <p className="text-slate-500 dark:text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${u.rol === 'admin'
                                                ? 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20'
                                                : 'bg-slate-50 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/20'}`}>
                                                {etiquetaRol[u.rol] ?? u.rol}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {u.rol === 'admin' ? (
                                                <span className="text-slate-400">No aplica</span>
                                            ) : (
                                                <div className="flex max-w-md flex-wrap gap-1.5">
                                                    {nombresEquipos.slice(0, 3).map(nombre => (
                                                        <span key={nombre} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300">{nombre}</span>
                                                    ))}
                                                    {nombresEquipos.length > 3 && (
                                                        <span className="rounded-md px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400" title={nombresEquipos.slice(3).join(', ')}>+{nombresEquipos.length - 3} más</span>
                                                    )}
                                                    {nombresEquipos.length === 0 && <span className="text-xs text-red-600 dark:text-red-400">Sin equipos</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                <span className={`h-2 w-2 rounded-full ${u.activo ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                {u.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button onClick={() => setFormulario({ usuario: u })} className={claseBotonIcono} title="Editar">
                                                    <Icono nombre="lapiz" className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setAccion({ tipo: 'restablecer', usuario: u })} className={claseBotonIcono} title="Restablecer contraseña">
                                                    <Icono nombre="llave" className="w-4 h-4" />
                                                </button>
                                                {!esYo && (
                                                    <button onClick={() => setAccion({ tipo: 'eliminar', usuario: u })} className={`${claseBotonIcono} hover:!text-red-600`} title="Eliminar">
                                                        <Icono nombre="basura" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No hay usuarios que coincidan con la búsqueda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <Modal show={formulario !== null} onClose={() => setFormulario(null)} maxWidth="2xl">
                {formulario && (
                    <FormularioUsuario
                        key={formulario.usuario?.id ?? 'nuevo'}
                        usuario={formulario.usuario}
                        equipos={equipos}
                        roles={roles}
                        onCerrar={() => setFormulario(null)}
                    />
                )}
            </Modal>

            <Modal show={accion !== null} onClose={() => setAccion(null)} maxWidth="md">
                <Confirmacion accion={accion} onCerrar={() => setAccion(null)} />
            </Modal>
        </PaginaSimpleLayout>
    );
}
