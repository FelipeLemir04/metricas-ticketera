<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AsegurarUsuarioActivo
{
    /**
     * Cierra la sesión de un usuario que fue desactivado mientras estaba conectado.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->activo) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'Tu cuenta fue desactivada. Contacta al administrador del panel.');
        }

        return $next($request);
    }
}
