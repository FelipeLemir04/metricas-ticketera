<?php

use App\Http\Controllers\Admin\EquipoController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/perfil', [ProfileController::class, 'edit'])->name('profile.edit');

    Route::middleware('can:administrar-usuarios')->prefix('admin')->name('admin.')->group(function () {
        Route::resource('usuarios', UsuarioController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::post('usuarios/{usuario}/restablecer-password', [UsuarioController::class, 'restablecerPassword'])
            ->name('usuarios.restablecer-password');

        Route::resource('equipos', EquipoController::class)->only(['index', 'update']);
    });
});

require __DIR__.'/auth.php';
