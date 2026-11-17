<?php

namespace App\Enums;

enum Rol: string
{
    /** Solo administra usuarios (crear, editar, suspender, eliminar); no ve tickets. */
    case Admin = 'admin';

    /** Director general: ve los tickets de todos los equipos del hospital, sin asignación. */
    case Director = 'director';

    /** Jefe de área: solo ve los tickets que atienden los equipos que tiene asignados. */
    case Jefe = 'jefe';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Director => 'Director general',
            self::Jefe => 'Jefe de área',
        };
    }

    /**
     * Qué puede hacer el rol, tal como se explica al elegirlo en la administración.
     */
    public function descripcion(): string
    {
        return match ($this) {
            self::Admin => 'Solo administra usuarios. No ve gráficos ni tickets.',
            self::Director => 'Ve los gráficos y tickets de todos los equipos del hospital.',
            self::Jefe => 'Ve los gráficos y tickets que atienden sus equipos.',
        };
    }
}
