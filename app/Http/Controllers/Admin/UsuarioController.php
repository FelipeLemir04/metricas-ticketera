<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Rol;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardarUsuarioRequest;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    /**
     * Listado de usuarios del panel con sus equipos asignados.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Usuarios', [
            'usuarios' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'rol', 'equipo_ids', 'activo', 'created_at']),
            'equipos' => Equipo::orderBy('nombre')->get(['id', 'nombre']),
            'roles' => collect(Rol::cases())->map(fn (Rol $rol) => [
                'valor' => $rol->value,
                'etiqueta' => $rol->etiqueta(),
            ]),
        ]);
    }

    /**
     * Crea un usuario con una contraseña temporal que se muestra una sola vez.
     */
    public function store(GuardarUsuarioRequest $request): RedirectResponse
    {
        $passwordTemporal = Str::password(12, symbols: false);

        $usuario = User::create([
            ...$this->datosValidados($request),
            'password' => $passwordTemporal,
        ]);

        return back()->with('passwordTemporal', [
            'email' => $usuario->email,
            'password' => $passwordTemporal,
            'motivo' => 'creado',
        ]);
    }

    /**
     * Actualiza datos, rol, equipos o estado de un usuario.
     */
    public function update(GuardarUsuarioRequest $request, User $usuario): RedirectResponse
    {
        $usuario->update($this->datosValidados($request));

        return back()->with('mensaje', "Usuario {$usuario->email} actualizado.");
    }

    /**
     * Genera una nueva contraseña temporal para el usuario.
     */
    public function restablecerPassword(User $usuario): RedirectResponse
    {
        $passwordTemporal = Str::password(12, symbols: false);

        $usuario->update(['password' => $passwordTemporal]);

        return back()->with('passwordTemporal', [
            'email' => $usuario->email,
            'password' => $passwordTemporal,
            'motivo' => 'restablecido',
        ]);
    }

    /**
     * Elimina un usuario (un admin no puede eliminarse a sí mismo).
     */
    public function destroy(Request $request, User $usuario): RedirectResponse
    {
        abort_if($usuario->is($request->user()), 403, 'No puedes eliminar tu propia cuenta.');

        $usuario->delete();

        return back()->with('mensaje', "Usuario {$usuario->email} eliminado.");
    }

    /**
     * @return array{name: string, email: string, rol: string, equipo_ids: list<int>, activo: bool}
     */
    private function datosValidados(GuardarUsuarioRequest $request): array
    {
        $validados = $request->validated();

        // El admin no ve tickets, así que no tiene equipos asignados
        $equipoIds = $validados['rol'] === Rol::Admin->value ? [] : ($validados['equipo_ids'] ?? []);

        return [
            'name' => $validados['name'],
            'email' => $validados['email'],
            'rol' => $validados['rol'],
            'equipo_ids' => array_values(array_map('intval', $equipoIds)),
            'activo' => $validados['activo'] ?? true,
        ];
    }
}
