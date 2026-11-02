<?php

namespace Tests\Feature\Admin;

use App\Enums\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdministracionUsuariosTest extends TestCase
{
    use RefreshDatabase;

    // Equipos cargados por la migración `create_equipos_table`
    private const RRHH = 7;

    private const INFORMATICA = 4;

    private const EQUIPO_INEXISTENTE = 999;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
    }

    public function test_invitado_es_redirigido_al_login(): void
    {
        $this->get('/admin/usuarios')->assertRedirect('/login');
    }

    public function test_jefe_no_puede_entrar_a_la_administracion(): void
    {
        $jefe = User::factory()->jefeDe([self::RRHH])->create();

        $this->actingAs($jefe)->get('/admin/usuarios')->assertForbidden();
    }

    public function test_admin_ve_el_listado_de_usuarios(): void
    {
        User::factory()->jefeDe([self::RRHH])->create();

        $response = $this->actingAs($this->admin)->get('/admin/usuarios');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Usuarios')
            ->has('usuarios', 2)
            ->has('equipos', 11)
        );
    }

    public function test_admin_crea_un_jefe_con_contrasena_temporal(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/usuarios', [
            'name' => 'María Pérez',
            'email' => 'maria@hu.cl',
            'rol' => 'jefe',
            'equipo_ids' => [self::RRHH],
        ]);

        $response->assertRedirect()->assertSessionHas('passwordTemporal.email', 'maria@hu.cl');

        $jefe = User::where('email', 'maria@hu.cl')->firstOrFail();
        $this->assertSame(Rol::Jefe, $jefe->rol);
        $this->assertSame([self::RRHH], $jefe->equiposAsignados());
        $this->assertTrue($jefe->activo);
        $this->assertTrue(Hash::check(session('passwordTemporal.password'), $jefe->password));
    }

    public function test_un_admin_se_guarda_sin_equipos(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/usuarios', [
            'name' => 'Otro Admin',
            'email' => 'otro.admin@hu.cl',
            'rol' => 'admin',
            'equipo_ids' => [self::RRHH],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame([], User::where('email', 'otro.admin@hu.cl')->firstOrFail()->equiposAsignados());
    }

    public function test_un_jefe_debe_tener_al_menos_un_equipo(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/usuarios', [
            'name' => 'María Pérez',
            'email' => 'maria@hu.cl',
            'rol' => 'jefe',
            'equipo_ids' => [],
        ]);

        $response->assertSessionHasErrors(['equipo_ids' => 'Un jefe de área debe tener al menos un equipo asignado.']);
        $this->assertDatabaseMissing('users', ['email' => 'maria@hu.cl']);
    }

    public function test_no_se_puede_asignar_un_equipo_que_no_existe(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/usuarios', [
            'name' => 'María Pérez',
            'email' => 'maria@hu.cl',
            'rol' => 'jefe',
            'equipo_ids' => [self::EQUIPO_INEXISTENTE],
        ]);

        $response->assertSessionHasErrors('equipo_ids.0');
        $this->assertDatabaseMissing('users', ['email' => 'maria@hu.cl']);
    }

    public function test_el_correo_no_puede_repetirse(): void
    {
        User::factory()->create(['email' => 'maria@hu.cl']);

        $response = $this->actingAs($this->admin)->post('/admin/usuarios', [
            'name' => 'Otra María',
            'email' => 'maria@hu.cl',
            'rol' => 'jefe',
            'equipo_ids' => [self::RRHH],
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertDatabaseCount('users', 2);
    }

    public function test_admin_actualiza_equipos_y_desactiva_un_usuario(): void
    {
        $jefe = User::factory()->jefeDe([self::RRHH])->create();

        $response = $this->actingAs($this->admin)->put("/admin/usuarios/{$jefe->id}", [
            'name' => $jefe->name,
            'email' => $jefe->email,
            'rol' => 'jefe',
            'equipo_ids' => [self::RRHH, self::INFORMATICA],
            'activo' => false,
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $jefe->refresh();
        $this->assertSame([self::RRHH, self::INFORMATICA], $jefe->equiposAsignados());
        $this->assertFalse($jefe->activo);
    }

    public function test_admin_no_puede_quitarse_el_rol_ni_desactivarse(): void
    {
        $response = $this->actingAs($this->admin)->put("/admin/usuarios/{$this->admin->id}", [
            'name' => $this->admin->name,
            'email' => $this->admin->email,
            'rol' => 'jefe',
            'equipo_ids' => [self::RRHH],
            'activo' => false,
        ]);

        $response->assertSessionHasErrors([
            'rol' => 'No puedes quitarte el rol de administrador.',
            'activo' => 'No puedes desactivar tu propia cuenta.',
        ]);
        $this->assertTrue($this->admin->refresh()->isAdmin());
        $this->assertTrue($this->admin->activo);
    }

    public function test_admin_restablece_la_contrasena_de_un_usuario(): void
    {
        $jefe = User::factory()->jefeDe([self::RRHH])->create();

        $response = $this->actingAs($this->admin)->post("/admin/usuarios/{$jefe->id}/restablecer-password");

        $response->assertRedirect()->assertSessionHas('passwordTemporal.email', $jefe->email);
        $this->assertTrue(Hash::check(session('passwordTemporal.password'), $jefe->refresh()->password));
        $this->assertFalse(Hash::check('password', $jefe->password));
    }

    public function test_admin_elimina_a_otro_usuario(): void
    {
        $jefe = User::factory()->jefeDe([self::RRHH])->create();

        $this->actingAs($this->admin)->delete("/admin/usuarios/{$jefe->id}")->assertRedirect();

        $this->assertModelMissing($jefe);
    }

    public function test_admin_no_puede_eliminarse_a_si_mismo(): void
    {
        $this->actingAs($this->admin)->delete("/admin/usuarios/{$this->admin->id}")->assertForbidden();

        $this->assertModelExists($this->admin);
    }
}
