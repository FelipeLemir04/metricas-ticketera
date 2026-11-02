<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Rol;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'rol', 'equipo_ids', 'activo'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'rol' => Rol::class,
            'equipo_ids' => 'array',
            'activo' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->rol === Rol::Admin;
    }

    /**
     * Equipos (ticketeras) que el usuario tiene asignados.
     *
     * @return list<int>
     */
    public function equiposAsignados(): array
    {
        return array_values(array_map('intval', $this->equipo_ids ?? []));
    }
}
