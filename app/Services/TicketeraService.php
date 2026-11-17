<?php

namespace App\Services;

use App\Models\Equipo;
use Carbon\Carbon;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Consultas de solo lectura sobre la base de la ticketera del hospital.
 *
 * Cada ticket lo atiende un equipo ("ticketera", tabla `ticketera_ticket`) y lo solicita un
 * departamento (`ticket.departamento_id`). El dashboard muestra lo que atiende un equipo.
 */
class TicketeraService
{
    private function conexion(): ConnectionInterface
    {
        return DB::connection('ticketera');
    }

    /**
     * Tickets (alias `t`) atendidos por el equipo, opcionalmente filtrados por año de creación.
     */
    private function ticketsDelEquipo(int $equipoId, ?string $anioSeleccionado = null): Builder
    {
        return $this->ticketsDeLosEquipos([$equipoId], $anioSeleccionado);
    }

    /**
     * Tickets (alias `t`) atendidos por cualquiera de los equipos; `tt.ticketera_id` indica cuál.
     *
     * @param  list<int>  $equipoIds
     */
    private function ticketsDeLosEquipos(array $equipoIds, ?string $anioSeleccionado = null): Builder
    {
        return $this->conexion()->table('ticket as t')
            ->join('ticketera_ticket as tt', function (JoinClause $join) use ($equipoIds) {
                $join->on('tt.ticket_id', '=', 't.id')
                    ->where('tt.type', 'ticket')
                    ->whereIn('tt.ticketera_id', $equipoIds);
            })
            ->when($anioSeleccionado, fn (Builder $q) => $q->whereYear('t.created_at', $anioSeleccionado));
    }

    /**
     * Comparativa de todos los equipos y tickets cerrados por mes, para el resumen del director general.
     *
     * Sin año seleccionado, la tendencia cubre los últimos 12 meses; con año, sus meses hasta hoy.
     *
     * @param  Collection<int, Equipo>  $equipos
     * @return array{porEquipo: list<array{id: int, nombre: string, total: int, por_estado: array<string, int>}>, tendenciaMensual: list<array{mes: string, cantidad: int}>}
     */
    public function resumenHospital(Collection $equipos, ?string $anioSeleccionado): array
    {
        $equipoIds = $equipos->pluck('id')->all();
        $estados = $this->conexion()->table('estado')->orderBy('id')->pluck('nombre', 'id');

        $conteosPorEquipo = $this->ticketsDeLosEquipos($equipoIds, $anioSeleccionado)
            ->select('tt.ticketera_id', 't.estado_id', DB::raw('COUNT(t.id) as cantidad'))
            ->groupBy('tt.ticketera_id', 't.estado_id')
            ->get()
            ->groupBy('ticketera_id');

        $porEquipo = $equipos->map(function (Equipo $equipo) use ($conteosPorEquipo, $estados) {
            $conteos = $conteosPorEquipo->get($equipo->id, collect());

            return [
                'id' => $equipo->id,
                'nombre' => $equipo->nombre,
                'total' => (int) $conteos->sum('cantidad'),
                'por_estado' => $estados->mapWithKeys(fn (string $nombre, int $estadoId) => [
                    $nombre => (int) ($conteos->firstWhere('estado_id', $estadoId)?->cantidad ?? 0),
                ])->all(),
            ];
        })->values()->all();

        return [
            'porEquipo' => $porEquipo,
            'tendenciaMensual' => $this->cerradosPorMes($equipoIds, $anioSeleccionado),
        ];
    }

    /**
     * Tickets cerrados en cada mes del período, con los meses sin cierres en cero.
     *
     * La ticketera no guarda la fecha de cierre: al cerrar se actualiza el ticket, así que se usa
     * el `updated_at` de los tickets que siguen cerrados (igual que la columna de cierre de la tabla).
     *
     * @param  list<int>  $equipoIds
     * @return list<array{mes: string, cantidad: int}>
     */
    private function cerradosPorMes(array $equipoIds, ?string $anioSeleccionado): array
    {
        $mesActual = now()->startOfMonth();

        $meses = $anioSeleccionado
            ? collect(range(1, 12))
                ->map(fn (int $mes) => Carbon::create((int) $anioSeleccionado, $mes))
                ->filter(fn (Carbon $mes) => $mes->lte($mesActual))
                ->values()
            : collect(range(11, 0))->map(fn (int $mesesAtras) => $mesActual->copy()->subMonths($mesesAtras));

        if ($meses->isEmpty()) {
            return [];
        }

        $cantidadPorMes = $this->ticketsDeLosEquipos($equipoIds)
            ->join('estado as e', 't.estado_id', '=', 'e.id')
            ->where('e.nombre', 'Cerrado')
            ->whereBetween('t.updated_at', [$meses->first()->copy()->startOfMonth(), $meses->last()->copy()->endOfMonth()])
            ->select(DB::raw('DATE_FORMAT(t.updated_at, "%Y-%m") as mes'), DB::raw('COUNT(t.id) as cantidad'))
            ->groupBy('mes')
            ->pluck('cantidad', 'mes');

        return $meses->map(fn (Carbon $mes) => [
            'mes' => $mes->format('Y-m'),
            'cantidad' => (int) ($cantidadPorMes[$mes->format('Y-m')] ?? 0),
        ])->all();
    }

    /**
     * Métricas, gráficos y tabla del dashboard para un equipo.
     *
     * @return array<string, mixed>
     */
    public function metricasDashboard(int $equipoId, ?string $anioSeleccionado): array
    {
        $ticketera = $this->conexion();

        $queryTickets = $this->ticketsDelEquipo($equipoId, $anioSeleccionado);

        // --- KPIs DINÁMICOS CON TODOS LOS ESTADOS ---
        $totalTickets = (clone $queryTickets)->count();

        // Obtenemos todos los estados posibles en la base de datos
        $todosLosEstados = $ticketera->table('estado')->orderBy('id', 'asc')->get();

        $porEstado = [];
        foreach ($todosLosEstados as $est) {
            $porEstado[] = [
                'estado' => $est->nombre,
                'cantidad' => (clone $queryTickets)->where('t.estado_id', $est->id)->count(),
            ];
        }

        $kpis = [
            'total' => $totalTickets,
            'por_estado' => $porEstado,
        ];

        // 1. Carga de Trabajo (Resueltos por Técnico) - Trae TODOS
        $cerradosPorTecnico = $this->ticketsDelEquipo($equipoId, $anioSeleccionado)
            ->leftJoin('estado as e', 't.estado_id', '=', 'e.id')
            ->leftJoin('users as u', 't.cerrado_por', '=', 'u.id')
            ->where('e.nombre', 'Cerrado')
            ->whereNotNull('t.cerrado_por')
            ->select(DB::raw('IFNULL(u.name_and_surname, "Usuario Desconocido") as tecnico'), DB::raw('COUNT(t.id) as cantidad'))
            ->groupBy('tecnico')
            ->orderByDesc('cantidad')
            ->get();

        // 2. Pedidos por departamento solicitante
        $pedidosPorDepartamento = $this->ticketsDelEquipo($equipoId, $anioSeleccionado)
            ->leftJoin('departamento as d', 't.departamento_id', '=', 'd.id')
            ->select(DB::raw('IFNULL(d.nombre, "Sin departamento") as departamento'), DB::raw('COUNT(t.id) as cantidad'))
            ->groupBy('departamento')
            ->orderByDesc('cantidad')
            ->get();

        // 3. Tabla completa
        $ticketsTabla = $this->ticketsDelEquipo($equipoId)
            ->leftJoin('estado as e', 't.estado_id', '=', 'e.id')
            ->leftJoin('prioridad as p', 't.prioridad_id', '=', 'p.id')
            ->leftJoin('tipo_problemas as tp', 't.tipo_problema_id', '=', 'tp.id')
            ->leftJoin('departamento as d', 't.departamento_id', '=', 'd.id')
            ->leftJoin('users as u', 't.cerrado_por', '=', 'u.id')
            ->select(
                't.id as Nro_Ticket',
                't.asunto as Asunto',
                'e.nombre as Estado',
                'p.nombre as Prioridad',
                DB::raw('IFNULL(tp.nombre, "Sin clasificar") as Tipo_Problema'),
                DB::raw('IFNULL(d.nombre, "Sin departamento") as Departamento'),
                DB::raw('IFNULL(u.name_and_surname, "Sin asignar") as Tecnico'),
                DB::raw('DATE(t.created_at) as fecha_filtro'),
                DB::raw('YEAR(t.created_at) as anio'),
                DB::raw('DATE_FORMAT(t.created_at, "%d/%m/%Y") as Fecha_Creacion'),
                // La ticketera no guarda la fecha de cierre: al cerrar se actualiza el ticket, así que updated_at la refleja
                DB::raw('IF(e.nombre = "Cerrado", DATE_FORMAT(t.updated_at, "%d/%m/%Y"), NULL) as Fecha_Cierre')
            )
            ->orderBy('t.id', 'desc')
            ->get();

        // 4. Listas únicas para filtros
        $listaTecnicos = $this->ticketsDelEquipo($equipoId)
            ->leftJoin('users as u', 't.cerrado_por', '=', 'u.id')
            ->whereNotNull('t.cerrado_por')
            ->select('u.name_and_surname as tecnico')
            ->distinct()
            ->orderBy('tecnico', 'asc')
            ->pluck('tecnico');

        $listaAnios = $this->ticketsDelEquipo($equipoId)
            ->whereNotNull('t.created_at')
            ->select(DB::raw('YEAR(t.created_at) as anio'))
            ->distinct()
            ->orderBy('anio', 'desc')
            ->pluck('anio');

        // Lista única de los estados
        $listaEstados = $ticketera->table('estado')->orderBy('nombre', 'asc')->pluck('nombre');

        return [
            'kpis' => $kpis,
            'cerradosPorTecnico' => $cerradosPorTecnico,
            'pedidosPorDepartamento' => $pedidosPorDepartamento,
            'ticketsTabla' => $ticketsTabla,
            'listaTecnicos' => $listaTecnicos,
            'listaAnios' => $listaAnios,
            'listaEstados' => $listaEstados,
        ];
    }
}
