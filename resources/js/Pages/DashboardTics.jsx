import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

// --- ÍCONOS (trazos de Heroicons, outline 24px) ---
const ICONOS = {
    graficos: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
    tabla: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5',
    sol: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
    luna: 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
    bandeja: 'M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z',
    check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    reloj: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    usuario: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
    chat: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
    pausa: 'M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    marcador: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z',
    buscar: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
    calendario: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
    cerrar: 'M6 18 18 6M6 6l12 12',
    izquierda: 'M15.75 19.5 8.25 12l7.5-7.5',
    derecha: 'm8.25 4.5 7.5 7.5-7.5 7.5',
    llave: 'M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z',
    salir: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9',
    edificio: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
};

function Icono({ nombre, className = 'w-5 h-5' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className={className} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONOS[nombre]} />
        </svg>
    );
}

// --- ESTADOS: color de estado + ícono + etiqueta (nunca solo color) ---
const ESTADOS = {
    'Cerrado': {
        color: '#0ca30c', icono: 'check',
        chip: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
        badge: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
    },
    'Pendiente': {
        color: '#fab219', icono: 'reloj',
        chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        badge: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
    },
    'Respondido por cliente': {
        color: '#ec835a', icono: 'usuario',
        chip: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
        badge: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20',
    },
    'Respondido por el staff': {
        color: '#2a78d6', icono: 'chat',
        chip: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        badge: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
    },
    'Detenido': {
        color: '#d03b3b', icono: 'pausa',
        chip: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        badge: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
    },
};

const ESTADO_DESCONOCIDO = {
    color: '#898781', icono: 'marcador',
    chip: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    badge: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/20',
};

const getEstiloEstado = (nombreEstado) => ESTADOS[nombreEstado] || ESTADO_DESCONOCIDO;

const PRIORIDADES = {
    'Alta': 'bg-red-500',
    'Media': 'bg-amber-400',
    'Baja': 'bg-slate-400',
};

const ordenEstados = ['Cerrado', 'Pendiente', 'Respondido por cliente', 'Respondido por el staff', 'Detenido'];

const formatearNumero = (n) => Number(n || 0).toLocaleString('es-CL');
const porcentaje = (parte, total) => (total > 0 ? Math.round((parte / total) * 1000) / 10 : 0);

// --- COMPONENTES DE PRESENTACIÓN ---
function Tarjeta({ titulo, subtitulo, acciones, children, className = '' }) {
    return (
        <section className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm ${className}`}>
            {(titulo || acciones) && (
                <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{titulo}</h2>
                        {subtitulo && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitulo}</p>}
                    </div>
                    {acciones}
                </div>
            )}
            <div className="p-6 pt-4">{children}</div>
        </section>
    );
}

function TooltipGrafico({ active, payload, label, unidad }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatearNumero(payload[0].value)} {unidad}
            </p>
        </div>
    );
}

function GraficoBarrasHorizontal({ datos, campoEtiqueta, unidad, tema }) {
    const alto = Math.max(200, datos.length * 38 + 24);
    return (
        <div style={{ height: alto, width: '100%' }}>
            <ResponsiveContainer>
                <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke={tema.grilla} />
                    <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: tema.ejes, fontSize: 12 }} />
                    <YAxis
                        dataKey={campoEtiqueta}
                        type="category"
                        width={170}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={{ fill: tema.textoSecundario, fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: tema.cursor }} content={<TooltipGrafico unidad={unidad} />} />
                    <Bar
                        dataKey="cantidad"
                        fill={tema.serie}
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                        label={{ position: 'right', fill: tema.textoSecundario, fontSize: 12, fontWeight: 600 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function BotonPaginacion({ onClick, disabled, children, etiqueta }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={etiqueta}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
            {children}
        </button>
    );
}

const claseCampo = 'w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500';
const claseEtiqueta = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5';

export default function DashboardTics({ kpis, cerradosPorTecnico, ticketsTabla, listaTecnicos, listaAnios, listaEstados, anioSeleccionado, equipos, equipoSeleccionado, pedidosPorDepartamento }) {
    const { auth } = usePage().props;
    const [vista, setVista] = useState('dashboard');

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const [filtroNro, setFiltroNro] = useState('');
    const [filtroTecnico, setFiltroTecnico] = useState('');
    const [filtroAnioTabla, setFiltroAnioTabla] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroSolicitante, setFiltroSolicitante] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    // Departamentos que aparecen como solicitantes en los tickets del equipo
    const listaSolicitantes = useMemo(
        () => [...new Set(ticketsTabla.map(ticket => ticket.Departamento))].sort((a, b) => a.localeCompare(b, 'es')),
        [ticketsTabla]
    );

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 15;

    const [paginaGrafico, setPaginaGrafico] = useState(1);
    const tecnicosPorPaginaGrafico = 10;
    const maxDepartamentosGrafico = 10;

    const indiceUltimoTecnico = paginaGrafico * tecnicosPorPaginaGrafico;
    const indicePrimerTecnico = indiceUltimoTecnico - tecnicosPorPaginaGrafico;
    const graficoPaginado = cerradosPorTecnico.slice(indicePrimerTecnico, indiceUltimoTecnico);
    const totalPaginasGrafico = Math.ceil(cerradosPorTecnico.length / tecnicosPorPaginaGrafico);

    const handleCambioAnioGraficos = (e) => {
        const anio = e.target.value;
        router.get('/', { anio: anio, equipo: equipoSeleccionado.id }, { preserveState: true, preserveScroll: true });
    };

    // Al cambiar de equipo se reinician filtros y paginación (preserveState: false)
    const handleCambioEquipo = (e) => {
        router.get('/', { equipo: e.target.value }, { preserveScroll: true });
    };

    const ticketsFiltrados = ticketsTabla.filter(ticket => {
        const matchNro = filtroNro === '' || String(ticket.Nro_Ticket).includes(filtroNro);
        const matchTecnico = filtroTecnico === '' || ticket.Tecnico === filtroTecnico;
        const matchAnio = filtroAnioTabla === '' || String(ticket.anio) === String(filtroAnioTabla);
        const matchEstado = filtroEstado === '' || ticket.Estado === filtroEstado;
        const matchSolicitante = filtroSolicitante === '' || ticket.Departamento === filtroSolicitante;
        const matchFecha = filtroFecha === '' || ticket.fecha_filtro === filtroFecha;
        return matchNro && matchTecnico && matchAnio && matchEstado && matchSolicitante && matchFecha;
    });

    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const ticketsPaginados = ticketsFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);
    const totalPaginas = Math.ceil(ticketsFiltrados.length / registrosPorPagina);

    const handleFiltroNro = (e) => { setFiltroNro(e.target.value); setPaginaActual(1); };
    const handleFiltroTecnico = (e) => { setFiltroTecnico(e.target.value); setPaginaActual(1); };
    const handleFiltroAnioTabla = (e) => { setFiltroAnioTabla(e.target.value); setPaginaActual(1); };
    const handleFiltroEstado = (e) => { setFiltroEstado(e.target.value); setPaginaActual(1); };
    const handleFiltroSolicitante = (e) => { setFiltroSolicitante(e.target.value); setPaginaActual(1); };
    const handleFiltroFecha = (e) => { setFiltroFecha(e.target.value); setPaginaActual(1); };

    const hayFiltrosTabla = filtroNro || filtroTecnico || filtroAnioTabla || filtroEstado || filtroSolicitante || filtroFecha;

    const limpiarFiltrosTabla = () => {
        setFiltroNro('');
        setFiltroTecnico('');
        setFiltroAnioTabla('');
        setFiltroEstado('');
        setFiltroSolicitante('');
        setFiltroFecha('');
        setPaginaActual(1);
    };

    // Colores de Recharts (no admite clases de Tailwind)
    const tema = darkMode
        ? { serie: '#3987e5', grilla: '#2c2c2a', ejes: '#898781', textoSecundario: '#c3c2b7', cursor: 'rgba(255,255,255,0.04)' }
        : { serie: '#2a78d6', grilla: '#e1e0d9', ejes: '#898781', textoSecundario: '#52514e', cursor: 'rgba(11,11,11,0.04)' };

    const estadosKpi = ordenEstados.map(nombreEstado =>
        kpis.por_estado.find(e => e.estado === nombreEstado) || { estado: nombreEstado, cantidad: 0 }
    );
    const cerrados = estadosKpi.find(e => e.estado === 'Cerrado')?.cantidad || 0;
    const abiertos = kpis.total - cerrados;
    const tasaCierre = porcentaje(cerrados, kpis.total);
    const periodo = anioSeleccionado ? `Año ${anioSeleccionado}` : 'Histórico completo';

    const navegacion = [
        { id: 'dashboard', etiqueta: 'Gráficos', icono: 'graficos' },
        { id: 'tabla', etiqueta: 'Tabla de tickets', icono: 'tabla' },
    ];

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="flex h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
                <Head title={`Dashboard · ${equipoSeleccionado.nombre}`} />

                {/* BARRA LATERAL */}
                <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#002b49] dark:bg-slate-900 dark:border-r dark:border-slate-800 text-white">
                    <div className="px-6 pt-7 pb-6 border-b border-white/10">
                        <img
                            src="/LOGOHU.png"
                            alt="Hospital Universitario"
                            className="w-full h-auto object-contain max-h-14 filter brightness-0 invert"
                        />
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200/70">Panel de tickets</p>
                    </div>
                    <nav className="flex-1 px-3 py-5 space-y-1">
                        {navegacion.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setVista(item.id)}
                                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors ${vista === item.id
                                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                                    : 'text-blue-100/70 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icono nombre={item.icono} />
                                <span>{item.etiqueta}</span>
                                {vista === item.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-300" />}
                            </button>
                        ))}
                    </nav>
                    <div className="p-3 border-t border-white/10 space-y-1">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <Icono nombre={darkMode ? 'sol' : 'luna'} />
                            <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
                        </button>
                        <Link
                            href="/perfil"
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <Icono nombre="llave" />
                            <span>Cambiar contraseña</span>
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <Icono nombre="salir" />
                            <span>Cerrar sesión</span>
                        </Link>
                        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-300/20 text-xs font-bold text-sky-200">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{auth.user.name}</p>
                                <p className="truncate text-xs text-blue-100/60">{auth.user.email}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CONTENIDO PRINCIPAL */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-sky-400">{equipoSeleccionado.nombre}</p>
                                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {vista === 'dashboard' ? 'Gráficos y métricas' : 'Tabla de tickets'}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {equipos.length > 1 && (
                                    <label className="flex items-center gap-2">
                                        <Icono nombre="edificio" className="w-4 h-4 text-slate-400" />
                                        <span className="sr-only">Equipo</span>
                                        <select
                                            value={equipoSeleccionado.id}
                                            onChange={handleCambioEquipo}
                                            className="max-w-[16rem] rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-3 pr-9 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {equipos.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {vista === 'dashboard' && (
                                    <label className="flex items-center gap-2">
                                        <Icono nombre="calendario" className="w-4 h-4 text-slate-400" />
                                        <span className="sr-only">Filtrar gráficos por año</span>
                                        <select
                                            value={anioSeleccionado}
                                            onChange={handleCambioAnioGraficos}
                                            className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-3 pr-9 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Todos los años</option>
                                            {listaAnios.map((anio, idx) => (
                                                <option key={idx} value={anio}>{anio}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <div className="md:hidden flex items-center gap-1">
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Cambiar modo oscuro/claro"
                                    >
                                        <Icono nombre={darkMode ? 'sol' : 'luna'} />
                                    </button>
                                    <Link
                                        href="/perfil"
                                        className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Cambiar contraseña"
                                    >
                                        <Icono nombre="llave" />
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Cerrar sesión"
                                    >
                                        <Icono nombre="salir" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Navegación en móvil */}
                        <div className="md:hidden mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                            {navegacion.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setVista(item.id)}
                                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${vista === item.id
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <Icono nombre={item.icono} className="w-4 h-4" />
                                    {item.etiqueta}
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
                        <div className="mx-auto max-w-7xl space-y-6">

                            {vista === 'dashboard' && (
                                <>
                                    {/* RESUMEN GENERAL */}
                                    <Tarjeta>
                                        <div className="flex flex-wrap items-end justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-sky-400">
                                                    <Icono nombre="bandeja" className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tickets en el período · {periodo}</p>
                                                    <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{formatearNumero(kpis.total)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-8">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tasa de cierre</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{tasaCierre.toLocaleString('es-CL')}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Abiertos</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatearNumero(abiertos)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barra de composición por estado */}
                                        {kpis.total > 0 && (
                                            <div className="mt-6">
                                                <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                    {estadosKpi.filter(e => e.cantidad > 0).map(e => (
                                                        <div
                                                            key={e.estado}
                                                            title={`${e.estado}: ${formatearNumero(e.cantidad)} (${porcentaje(e.cantidad, kpis.total)}%)`}
                                                            style={{ width: `${porcentaje(e.cantidad, kpis.total)}%`, minWidth: 4, backgroundColor: getEstiloEstado(e.estado).color }}
                                                            className="h-full first:rounded-l-full last:rounded-r-full"
                                                        />
                                                    ))}
                                                </div>
                                                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                                                    {estadosKpi.map(e => (
                                                        <li key={e.estado} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getEstiloEstado(e.estado).color }} />
                                                            {e.estado}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </Tarjeta>

                                    {/* TARJETAS POR ESTADO */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {estadosKpi.map(estadoData => {
                                            const estilo = getEstiloEstado(estadoData.estado);
                                            const pct = porcentaje(estadoData.cantidad, kpis.total);
                                            return (
                                                <div key={estadoData.estado} className="group rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${estilo.chip}`}>
                                                            <Icono nombre={estilo.icono} />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{pct.toLocaleString('es-CL')}%</span>
                                                    </div>
                                                    <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{formatearNumero(estadoData.cantidad)}</p>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-snug">{estadoData.estado}</p>
                                                    <div className="mt-4 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: estilo.color }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* GRÁFICOS */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                                        <Tarjeta
                                            titulo="Carga de trabajo"
                                            subtitulo={`Tickets resueltos por técnico · ${periodo}`}
                                            acciones={totalPaginasGrafico > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <BotonPaginacion
                                                        onClick={() => setPaginaGrafico(prev => Math.max(prev - 1, 1))}
                                                        disabled={paginaGrafico === 1}
                                                        etiqueta="Página anterior"
                                                    >
                                                        <Icono nombre="izquierda" className="w-4 h-4" />
                                                    </BotonPaginacion>
                                                    <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
                                                        {paginaGrafico} / {totalPaginasGrafico}
                                                    </span>
                                                    <BotonPaginacion
                                                        onClick={() => setPaginaGrafico(prev => Math.min(prev + 1, totalPaginasGrafico))}
                                                        disabled={paginaGrafico === totalPaginasGrafico}
                                                        etiqueta="Página siguiente"
                                                    >
                                                        <Icono nombre="derecha" className="w-4 h-4" />
                                                    </BotonPaginacion>
                                                </div>
                                            )}
                                        >
                                            {graficoPaginado.length > 0 ? (
                                                <GraficoBarrasHorizontal datos={graficoPaginado} campoEtiqueta="tecnico" unidad="tickets cerrados" tema={tema} />
                                            ) : (
                                                <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Sin tickets cerrados en el período seleccionado.</p>
                                            )}
                                        </Tarjeta>

                                        <Tarjeta
                                            titulo="Pedidos por departamento"
                                            subtitulo={`Áreas del hospital que más solicitan al equipo · ${periodo}`}
                                        >
                                            {pedidosPorDepartamento.length > 0 ? (
                                                <>
                                                    <GraficoBarrasHorizontal datos={pedidosPorDepartamento.slice(0, maxDepartamentosGrafico)} campoEtiqueta="departamento" unidad="tickets" tema={tema} />
                                                    {pedidosPorDepartamento.length > maxDepartamentosGrafico && (
                                                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                            Se muestran los {maxDepartamentosGrafico} departamentos con más pedidos de {pedidosPorDepartamento.length}.
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Sin pedidos en el período seleccionado.</p>
                                            )}
                                        </Tarjeta>
                                    </div>
                                </>
                            )}

                            {vista === 'tabla' && (
                                <>
                                    {/* FILTROS */}
                                    <Tarjeta>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                            <div>
                                                <label className={claseEtiqueta}>Nro de ticket</label>
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                                                        <Icono nombre="buscar" className="w-4 h-4" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. 7112"
                                                        value={filtroNro}
                                                        onChange={handleFiltroNro}
                                                        className={`${claseCampo} pl-9`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={claseEtiqueta}>Técnico</label>
                                                <select value={filtroTecnico} onChange={handleFiltroTecnico} className={claseCampo}>
                                                    <option value="">Todos los técnicos</option>
                                                    {listaTecnicos.map((tec, idx) => (
                                                        <option key={idx} value={tec}>{tec}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={claseEtiqueta}>Año</label>
                                                <select value={filtroAnioTabla} onChange={handleFiltroAnioTabla} className={claseCampo}>
                                                    <option value="">Todos los años</option>
                                                    {listaAnios.map((anio, idx) => (
                                                        <option key={idx} value={anio}>{anio}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={claseEtiqueta}>Estado</label>
                                                <select value={filtroEstado} onChange={handleFiltroEstado} className={claseCampo}>
                                                    <option value="">Todos los estados</option>
                                                    {listaEstados.map((est, idx) => (
                                                        <option key={idx} value={est}>{est}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={claseEtiqueta}>Solicitante</label>
                                                <select value={filtroSolicitante} onChange={handleFiltroSolicitante} className={claseCampo}>
                                                    <option value="">Todos los solicitantes</option>
                                                    {listaSolicitantes.map(solicitante => (
                                                        <option key={solicitante} value={solicitante}>{solicitante}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className={claseEtiqueta}>Fecha de creación</label>
                                                <input type="date" value={filtroFecha} onChange={handleFiltroFecha} className={claseCampo} />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                <span className="font-semibold text-slate-900 dark:text-white">{formatearNumero(ticketsFiltrados.length)}</span> tickets encontrados
                                                {hayFiltrosTabla && <> de {formatearNumero(ticketsTabla.length)}</>}
                                            </p>
                                            {hayFiltrosTabla && (
                                                <button
                                                    onClick={limpiarFiltrosTabla}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <Icono nombre="cerrar" className="w-4 h-4" />
                                                    Limpiar filtros
                                                </button>
                                            )}
                                        </div>
                                    </Tarjeta>

                                    {/* TABLA */}
                                    <section className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                                                    <tr>
                                                        {['Nro', 'Creación', 'Cierre', 'Asunto', 'Solicitante', 'Tipo', 'Estado', 'Prioridad', 'Técnico'].map(columna => (
                                                            <th key={columna} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                                {columna}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {ticketsPaginados.length > 0 ? (
                                                        ticketsPaginados.map((ticket) => {
                                                            const estilo = getEstiloEstado(ticket.Estado);
                                                            return (
                                                                <tr key={ticket.Nro_Ticket} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold tabular-nums text-slate-900 dark:text-white">#{ticket.Nro_Ticket}</td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400">{ticket.Fecha_Creacion}</td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400">{ticket.Fecha_Cierre ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                                                                    <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 truncate max-w-xs" title={ticket.Asunto}>{ticket.Asunto}</td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{ticket.Departamento}</td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{ticket.Tipo_Problema}</td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estilo.badge}`}>
                                                                            <Icono nombre={estilo.icono} className="w-3.5 h-3.5" />
                                                                            {ticket.Estado || 'Sin estado'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                                        {ticket.Prioridad ? (
                                                                            <span className="inline-flex items-center gap-2">
                                                                                <span className={`h-2 w-2 rounded-full ${PRIORIDADES[ticket.Prioridad] || 'bg-slate-300'}`} />
                                                                                {ticket.Prioridad}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-slate-400">—</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{ticket.Tecnico}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="9"className="px-6 py-16 text-center">
                                                                <Icono nombre="buscar" className="mx-auto w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No se encontraron tickets</p>
                                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prueba ajustando o limpiando los filtros.</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {totalPaginas > 1 && (
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-5 py-3">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Mostrando <span className="font-medium text-slate-900 dark:text-white">{indicePrimerRegistro + 1}–{Math.min(indiceUltimoRegistro, ticketsFiltrados.length)}</span> de {formatearNumero(ticketsFiltrados.length)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <BotonPaginacion
                                                        onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                                        disabled={paginaActual === 1}
                                                        etiqueta="Página anterior"
                                                    >
                                                        <Icono nombre="izquierda" className="w-4 h-4" /> Anterior
                                                    </BotonPaginacion>
                                                    <span className="px-2 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                                                        {paginaActual} / {totalPaginas}
                                                    </span>
                                                    <BotonPaginacion
                                                        onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                                                        disabled={paginaActual === totalPaginas}
                                                        etiqueta="Página siguiente"
                                                    >
                                                        Siguiente <Icono nombre="derecha" className="w-4 h-4" />
                                                    </BotonPaginacion>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
