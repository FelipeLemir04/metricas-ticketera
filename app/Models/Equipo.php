<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Equipo que atiende tickets. Su id coincide con el `ticketera_id` de la ticketera del hospital.
 */
class Equipo extends Model
{
    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $fillable = ['nombre'];
}
