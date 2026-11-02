<?php

namespace App\Services;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
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
        return $this->conexion()->table('ticket as t')
            ->join('ticketera_ticket as tt', function (JoinClause $join) use ($equipoId) {
                $join->on('tt.ticket_id', '=', 't.id')
                    ->where('tt.type', 'ticket')
                    ->where('tt.ticketera_id', $equipoId);
            })
            ->when($anioSeleccionado, fn (Builder $q) => $q->whereYear('t.created_at', $anioSeleccionado));
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
