<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol', 20)->default('jefe')->after('password');
            // IDs de la tabla `departamento` de la ticketera (otra base, por eso no hay foreign key)
            $table->json('departamento_ids')->nullable()->after('rol');
            $table->boolean('activo')->default(true)->after('departamento_ids');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rol', 'departamento_ids', 'activo']);
        });
    }
};
