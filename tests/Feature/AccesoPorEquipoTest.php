<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TicketeraService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class AccesoPorEquipoTest extends TestCase
{
    use RefreshDatabase;

    // Equipos cargados por la migración `create_equipos_table`
    private const INFORMATICA = 4;

    private const RRHH = 7;

    private const BIENES_E_INSUMOS = 9;

    private const COMUNICACION = 10;

    /**
     * La ticketera es una base remota: se reemplaza por un doble.
     *
     * @param  int|null  $equipoEsperado  equipo con el que deben pedirse las métricas (null = nunca)
     * @param  bool  $conResumenHospital  si debe pedirse el resumen de todos los equipos (solo el director)
     */
    private function simularTicketera(?int $equipoEsperado, bool $conResumenHospital = false): void
    {
        $this->mock(TicketeraService::class, function (MockInterface $mock) use ($equipoEsperado, $conResumenHospital) {
            if ($equipoEsperado === null) {
                $mock->shouldNotReceive('metricasDashboard');
            } else {
                $mock->shouldReceive('metricasDashboard')->once()->with($equipoEsperado, null)->andReturn([]);
            }

            if ($conResumenHospital) {
                $mock->shouldReceive('resumenHospital')
                    ->once()
                    ->with(Mockery::on(fn ($equipos) => $equipos->count() === 10), null)
                    ->andReturn(['porEquipo' => [], 'tendenciaMensual' => []]);
            } else {
                $mock->shouldNotReceive('resumenHospital');
            }
        });
    }

    public function test_jefe_ve_solo_sus_equipos_y_por_defecto_el_primero_asignado(): void
    {
        $this->simularTicketera(self::RRHH);
        $jefe = User::factory()->jefeDe([self::RRHH, self::INFORMATICA])->create();

        $response = $this->actingAs($jefe)->get('/');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('DashboardTics')
            ->where('equipoSeleccionado.id', self::RRHH)
            ->where('equipoSeleccionado.nombre', 'RRHH')
            ->where('equipos', fn ($equipos) => collect($equipos)->pluck('id')->sort()->values()->all() === [self::INFORMATICA, self::RRHH])
            ->where('resumenHospital', null)
        );
    }

    public function test_jefe_puede_cambiar_entre_sus_equipos(): void
    {
        $this->simularTicketera(self::INFORMATICA);
        $jefe = User::factory()->jefeDe([self::RRHH, self::INFORMATICA])->create();

        $response = $this->actingAs($jefe)->get('/?equipo='.self::INFORMATICA);

        $response->assertInertia(fn (Assert $page) => $page->where('equipoSeleccionado.id', self::INFORMATICA));
    }

    public function test_jefe_no_puede_ver_un_equipo_que_no_tiene_asignado(): void
    {
        $this->simularTicketera(null);
        $jefe = User::factory()->jefeDe([self::INFORMATICA])->create();

        $response = $this->actingAs($jefe)->get('/?equipo='.self::BIENES_E_INSUMOS);

        $response->assertForbidden();
    }

    public function test_jefe_sin_equipos_asignados_no_puede_ver_el_dashboard(): void
    {
        $this->simularTicketera(null);
        $jefe = User::factory()->jefeDe([])->create();

        $response = $this->actingAs($jefe)->get('/');

        $response->assertForbidden();
    }

    public function test_director_ve_todos_los_equipos_y_por_defecto_el_primero_por_nombre(): void
    {
        $this->simularTicketera(self::COMUNICACION, conResumenHospital: true);
        $director = User::factory()->director()->create();

        $response = $this->actingAs($director)->get('/');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('DashboardTics')
            ->where('equipoSeleccionado.id', self::COMUNICACION)
            ->has('equipos', 10)
            ->has('resumenHospital.porEquipo')
            ->has('resumenHospital.tendenciaMensual')
        );
    }

    public function test_director_puede_ver_cualquier_equipo(): void
    {
        $this->simularTicketera(self::BIENES_E_INSUMOS, conResumenHospital: true);
        $director = User::factory()->director()->create();

        $response = $this->actingAs($director)->get('/?equipo='.self::BIENES_E_INSUMOS);

        $response->assertInertia(fn (Assert $page) => $page->where('equipoSeleccionado.id', self::BIENES_E_INSUMOS));
    }

    public function test_admin_no_ve_los_graficos_y_es_enviado_a_usuarios(): void
    {
        $this->simularTicketera(null);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/?equipo='.self::INFORMATICA);

        $response->assertRedirect(route('admin.usuarios.index'));
    }

    public function test_usuario_desactivado_no_puede_iniciar_sesion(): void
    {
        $usuario = User::factory()->jefeDe([self::INFORMATICA])->inactivo()->create();

        $response = $this->post('/login', ['email' => $usuario->email, 'password' => 'password']);

        $response->assertSessionHasErrors(['email' => 'Estas credenciales no coinciden con nuestros registros.']);
        $this->assertGuest();
    }

    public function test_usuario_desactivado_con_sesion_abierta_es_desconectado(): void
    {
        $usuario = User::factory()->jefeDe([self::INFORMATICA])->inactivo()->create();

        $response = $this->actingAs($usuario)->get('/');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_solo_los_admin_pueden_administrar_usuarios(): void
    {
        $this->assertTrue(Gate::forUser(User::factory()->admin()->make())->allows('administrar-usuarios'));
        $this->assertFalse(Gate::forUser(User::factory()->jefeDe([self::INFORMATICA])->make())->allows('administrar-usuarios'));
        $this->assertFalse(Gate::forUser(User::factory()->director()->make())->allows('administrar-usuarios'));
    }
}
