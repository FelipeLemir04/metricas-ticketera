<?php

namespace Tests\Feature\Admin;

use App\Models\Equipo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdministracionEquiposTest extends TestCase
{
    use RefreshDatabase;

    private const TICKETERA_SIN_NOMBRE = 2;

    public function test_admin_ve_los_equipos_de_la_ticketera(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/equipos');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Equipos')
            ->has('equipos', 11)
            ->where('equipos.3.nombre', 'Informática / TICS')
        );
    }

    public function test_admin_renombra_un_equipo(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->put('/admin/equipos/'.self::TICKETERA_SIN_NOMBRE, ['nombre' => 'Mantenimiento']);

        $response->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Mantenimiento', Equipo::find(self::TICKETERA_SIN_NOMBRE)->nombre);
    }

    public function test_el_nombre_del_equipo_es_obligatorio(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->put('/admin/equipos/'.self::TICKETERA_SIN_NOMBRE, ['nombre' => '']);

        $response->assertSessionHasErrors(['nombre' => 'El campo nombre es obligatorio.']);
        $this->assertSame('Ticketera 2', Equipo::find(self::TICKETERA_SIN_NOMBRE)->nombre);
    }

    public function test_jefe_no_puede_renombrar_equipos(): void
    {
        $jefe = User::factory()->jefeDe([4])->create();

        $this->actingAs($jefe)->put('/admin/equipos/'.self::TICKETERA_SIN_NOMBRE, ['nombre' => 'Otro'])->assertForbidden();

        $this->assertSame('Ticketera 2', Equipo::find(self::TICKETERA_SIN_NOMBRE)->nombre);
    }
}
