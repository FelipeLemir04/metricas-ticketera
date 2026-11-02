import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const temaOscuroGuardado = () => {
    try {
        return localStorage.getItem('theme') === 'dark';
    } catch {
        return false;
    }
};

const ICONOS = {
    volver: 'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18',
    usuarios: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    equipos: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
    llave:'M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z',
    salir: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9',
    sol: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
    luna: 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
};

function Icono({ nombre }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONOS[nombre]} />
        </svg>
    );
}

const claseEnlace = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-100/80 hover:bg-white/10 hover:text-white transition-colors';

/**
 * Página secundaria del panel (Mi cuenta, Administración): barra superior con logo y navegación.
 * El admin no tiene dashboard, así que su barra lleva a Usuarios en vez de "Volver al dashboard".
 */
export default function PaginaSimpleLayout({ children, ancho = 'max-w-3xl' }) {
    const { auth } = usePage().props;
    const [darkMode, setDarkMode] = useState(temaOscuroGuardado);

    // La clase va en <html> para que también la hereden los modales (se montan fuera de este árbol)
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        try {
            localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        } catch {
            // Sin almacenamiento disponible: el modo solo dura esta visita
        }
    }, [darkMode]);

    useEffect(() => () => document.documentElement.classList.remove('dark'), []);

    return (
        <div className="min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <header className="bg-[#002b49] dark:bg-slate-900 dark:border-b dark:border-slate-800">
                <div className={`mx-auto flex ${ancho} flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4`}>
                    <img src="/LOGOHU.png" alt="Hospital Universitario" className="h-9 w-auto object-contain filter brightness-0 invert" />
                    <nav className="flex flex-wrap items-center gap-1">
                        {auth.esAdmin ? (
                            <>
                                <Link href="/admin/usuarios" className={claseEnlace}>
                                    <Icono nombre="usuarios" /> Usuarios
                                </Link>
                                <Link href="/admin/equipos" className={claseEnlace}>
                                    <Icono nombre="equipos" /> Equipos
                                </Link>
                                <Link href="/perfil" className={claseEnlace}>
                                    <Icono nombre="llave" /> <span className="hidden sm:inline">Cambiar contraseña</span>
                                </Link>
                            </>
                        ) : (
                            <Link href="/" className={claseEnlace}>
                                <Icono nombre="volver" /> Volver al dashboard
                            </Link>
                        )}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={claseEnlace}
                            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                        >
                            <Icono nombre={darkMode ? 'sol' : 'luna'} />
                        </button>
                        <Link href="/logout" method="post" as="button" className={claseEnlace} title="Cerrar sesión">
                            <Icono nombre="salir" /> <span className="hidden sm:inline">Salir</span>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className={`mx-auto ${ancho} px-4 sm:px-8 py-8 space-y-6`}>
                {children}
            </main>
        </div>
    );
}
