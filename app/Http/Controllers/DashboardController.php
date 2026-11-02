<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Services\TicketeraService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard de los tickets que atiende el equipo seleccionado.
     *
     * Un jefe solo ve los equipos que tiene asignados. El admin no ve tickets:
     * únicamente administra usuarios, así que se le envía a esa sección.
     */
    public function __invoke(Request $request, TicketeraService $ticketera): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.usuarios.index');
        }

        $asignados = $user->equiposAsignados();

        $equiposVisibles = Equipo::whereIn('id', $asignados)->orderBy('nombre')->get(['id', 'nombre']);

        abort_if($equiposVisibles->isEmpty(), 403, 'No tienes equipos asignados. Contacta al administrador del panel.');

        if ($request->filled('equipo')) {
            $equipoId = $request->integer('equipo');

            abort_unless($equiposVisibles->contains('id', $equipoId), 403, 'No tienes acceso a ese equipo.');
        } else {
            $equipoId = collect($asignados)->first(fn ($id) => $equiposVisibles->contains('id', $id));
        }

        $anioSeleccionado = $request->input('anio');

        return Inertia::render('DashboardTics', [
            ...$ticketera->metricasDashboard($equipoId, $anioSeleccionado),
            'anioSeleccionado' => $anioSeleccionado ?? '',
            'equipos' => $equiposVisibles,
            'equipoSeleccionado' => $equiposVisibles->firstWhere('id', $equipoId),
        ]);
    }
}
