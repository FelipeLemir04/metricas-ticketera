<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Los jefes pasan de ver tickets por departamento solicitante a verlos por equipo que atiende.
     *
     * Departamentos con equipo equivalente confirmado: Tics (24) → Informática (4), RRHH (12) → RRHH (7).
     * El resto queda sin equipo y debe asignarse desde la administración.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('equipo_ids')->nullable()->after('rol');
        });

        $equipoPorDepartamento = [24 => 4, 12 => 7];

        DB::table('users')->whereNotNull('departamento_ids')->orderBy('id')->each(function (object $user) use ($equipoPorDepartamento) {
            $equipos = collect(json_decode($user->departamento_ids, true) ?? [])
                ->map(fn ($departamentoId) => $equipoPorDepartamento[(int) $departamentoId] ?? null)
                ->filter()
                ->unique()
                ->values()
                ->all();

            DB::table('users')->where('id', $user->id)->update(['equipo_ids' => json_encode($equipos)]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('departamento_ids');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('departamento_ids')->nullable()->after('rol');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('equipo_ids');
        });
    }
};
