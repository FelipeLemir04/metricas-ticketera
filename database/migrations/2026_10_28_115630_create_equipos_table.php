<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Equipos que atienden tickets. El id es el mismo `ticketera_id` de la ticketera del hospital,
     * que no guarda los nombres, por eso se mantienen aquí (editables desde la administración).
     */
    public function up(): void
    {
        Schema::create('equipos', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('nombre', 100);
            $table->timestamps();
        });

        $nombresConfirmados = [
            4 => 'Informática / TICS',
            7 => 'RRHH',
            9 => 'Gestión de Bienes e Insumos',
            10 => 'Comunicación / Diseño',
        ];

        DB::table('equipos')->insert(collect(range(1, 11))->map(fn (int $id) => [
            'id' => $id,
            'nombre' => $nombresConfirmados[$id] ?? "Ticketera {$id}",
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};
