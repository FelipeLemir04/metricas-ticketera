<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * La ticketera 8 no existe en la ticketera del hospital (no tiene tickets), así que se quita del panel.
     */
    public function up(): void
    {
        DB::table('equipos')->where('id', 8)->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('equipos')->insertOrIgnore([
            'id' => 8,
            'nombre' => 'Ticketera 8',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
