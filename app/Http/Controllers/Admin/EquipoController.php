<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipoController extends Controller
{
    /**
     * Equipos de la ticketera con sus nombres editables.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Equipos', [
            'equipos' => Equipo::orderBy('id')->get(['id', 'nombre']),
        ]);
    }

    /**
     * Cambia el nombre con el que se muestra un equipo en el panel.
     */
    public function update(Request $request, Equipo $equipo): RedirectResponse
    {
        $validados = $request->validate(
            ['nombre' => ['required', 'string', 'max:100']],
            [],
            ['nombre' => 'nombre'],
        );

        $equipo->update($validados);

        return back()->with('mensaje', "Equipo {$equipo->id} renombrado a \"{$equipo->nombre}\".");
    }
}
