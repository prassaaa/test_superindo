<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Material>
 */
class MaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $materials = ['Tepung Terigu', 'Gula Pasir', 'Minyak Goreng', 'Telur', 'Mentega', 'Susu', 'Coklat Bubuk'];
        $units = ['kg', 'liter', 'gram', 'pcs'];

        return [
            'name' => $this->faker->randomElement($materials),
            'code' => 'MAT' . $this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->sentence(),
            'unit' => $this->faker->randomElement($units),
            'stock_quantity' => $this->faker->numberBetween(0, 1000),
            'unit_price' => $this->faker->numberBetween(5000, 50000),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}
