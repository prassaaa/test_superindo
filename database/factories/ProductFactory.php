<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $products = ['Roti Tawar', 'Kue Donat', 'Biskuit', 'Kue Kering', 'Roti Manis', 'Croissant', 'Muffin'];
        $units = ['pcs', 'pack', 'box', 'kg'];

        return [
            'name' => $this->faker->randomElement($products),
            'code' => 'PRD' . $this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->sentence(),
            'unit' => $this->faker->randomElement($units),
            'stock_quantity' => $this->faker->numberBetween(0, 500),
            'unit_price' => $this->faker->numberBetween(3000, 25000),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}
