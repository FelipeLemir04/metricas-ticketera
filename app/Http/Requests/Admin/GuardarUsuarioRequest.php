<?php

namespace App\Http\Requests\Admin;

use App\Enums\Rol;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class GuardarUsuarioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('administrar-usuarios');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($this->route('usuario'))],
            'rol' => ['required', Rule::enum(Rol::class)],
            'equipo_ids' => ['array', Rule::requiredIf($this->input('rol') === Rol::Jefe->value)],
            'equipo_ids.*' => ['integer', 'distinct', Rule::exists('equipos', 'id')],
            'activo' => ['boolean'],
        ];
    }

    /**
     * Impide que un admin se quite a sí mismo el rol o se desactive.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $editandoseASiMismo = $this->route('usuario')?->is($this->user()) ?? false;

                if (! $editandoseASiMismo) {
                    return;
                }

                if ($this->input('rol') !== Rol::Admin->value) {
                    $validator->errors()->add('rol', 'No puedes quitarte el rol de administrador.');
                }

                if ($this->has('activo') && ! $this->boolean('activo')) {
                    $validator->errors()->add('activo', 'No puedes desactivar tu propia cuenta.');
                }
            },
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'rol' => 'rol',
            'equipo_ids' => 'equipos',
            'equipo_ids.*' => 'equipo',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'equipo_ids.required' => 'Un jefe de área debe tener al menos un equipo asignado.',
        ];
    }
}
