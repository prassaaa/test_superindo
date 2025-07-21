<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Product;

class SuperindoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample customers
        $customers = [
            [
                'name' => 'PT Epindo Jaya',
                'email' => 'contact@epindo.com',
                'phone' => '021-1234567',
                'address' => 'Jl. Industri No. 123, Jakarta',
                'contact_person' => 'Budi Santoso',
                'is_active' => true,
            ],
            [
                'name' => 'CV Maju Bersama',
                'email' => 'info@majubersama.co.id',
                'phone' => '021-7654321',
                'address' => 'Jl. Perdagangan No. 456, Bekasi',
                'contact_person' => 'Siti Rahayu',
                'is_active' => true,
            ],
            [
                'name' => 'PT Sukses Mandiri',
                'email' => 'admin@suksesmandiri.com',
                'phone' => '021-9876543',
                'address' => 'Jl. Bisnis No. 789, Tangerang',
                'contact_person' => 'Ahmad Wijaya',
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }

        // Create sample materials
        $materials = [
            [
                'name' => 'Tepung Terigu',
                'code' => 'MAT001',
                'description' => 'Tepung terigu protein tinggi untuk produksi roti',
                'unit' => 'kg',
                'stock_quantity' => 500.00,
                'unit_price' => 12000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Gula Pasir',
                'code' => 'MAT002',
                'description' => 'Gula pasir putih berkualitas tinggi',
                'unit' => 'kg',
                'stock_quantity' => 300.00,
                'unit_price' => 15000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Minyak Kelapa Sawit',
                'code' => 'MAT003',
                'description' => 'Minyak kelapa sawit untuk produksi makanan',
                'unit' => 'liter',
                'stock_quantity' => 200.00,
                'unit_price' => 18000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Telur Ayam',
                'code' => 'MAT004',
                'description' => 'Telur ayam segar grade A',
                'unit' => 'kg',
                'stock_quantity' => 100.00,
                'unit_price' => 25000.00,
                'is_active' => true,
            ],
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }

        // Create sample products
        $products = [
            [
                'name' => 'Roti Tawar',
                'code' => 'PRD001',
                'description' => 'Roti tawar putih kemasan 400g',
                'unit' => 'pcs',
                'stock_quantity' => 50.00,
                'unit_price' => 8000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Kue Donat',
                'code' => 'PRD002',
                'description' => 'Donat manis dengan berbagai topping',
                'unit' => 'pcs',
                'stock_quantity' => 75.00,
                'unit_price' => 5000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Biskuit Coklat',
                'code' => 'PRD003',
                'description' => 'Biskuit rasa coklat kemasan 200g',
                'unit' => 'pack',
                'stock_quantity' => 120.00,
                'unit_price' => 12000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Kue Kering',
                'code' => 'PRD004',
                'description' => 'Kue kering aneka rasa kemasan 300g',
                'unit' => 'pack',
                'stock_quantity' => 80.00,
                'unit_price' => 15000.00,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $this->command->info('Sample data for Superindo has been created successfully!');
    }
}
