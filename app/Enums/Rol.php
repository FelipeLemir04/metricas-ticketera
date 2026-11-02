<?php

namespace App\Enums;

enum Rol: string
{
    /** Solo administra usuarios (crear, editar, suspender, eliminar); no ve tickets. */
    case Admin = 'admin';

    /** Jefe de área: solo ve los tickets que atienden los equipos que tiene asignados. */
    case Jefe = 'jefe';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Jefe => 'Jefe de área',
        };
    }
}
