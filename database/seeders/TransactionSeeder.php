<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Product;
use App\Models\Incoming;
use App\Models\Production;
use App\Models\Invoice;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $materials = Material::all();
        $products = Product::all();

        // Create some incoming transactions
        $this->command->info('Creating incoming transactions...');

        foreach ($customers as $customer) {
            foreach ($materials->take(2) as $material) {
                Incoming::create([
                    'customer_id' => $customer->id,
                    'material_id' => $material->id,
                    'quantity' => rand(50, 200),
                    'unit_price' => $material->unit_price,
                    'incoming_date' => now()->subDays(rand(1, 30))->toDateString(),
                    'notes' => 'Sample incoming transaction',
                ]);
            }
        }

        // Create some production transactions
        $this->command->info('Creating production transactions...');

        foreach ($materials->take(3) as $material) {
            foreach ($products->take(2) as $product) {
                try {
                    Production::create([
                        'material_id' => $material->id,
                        'product_id' => $product->id,
                        'material_quantity_used' => rand(10, 50),
                        'product_quantity_produced' => rand(20, 80),
                        'production_date' => now()->subDays(rand(1, 15))->toDateString(),
                        'notes' => 'Sample production transaction',
                    ]);
                } catch (\Exception $e) {
                    $this->command->warn("Skipped production for {$material->name} -> {$product->name}: " . $e->getMessage());
                }
            }
        }

        // Create some invoice transactions
        $this->command->info('Creating invoice transactions...');

        foreach ($customers as $customer) {
            foreach ($products->take(2) as $product) {
                try {
                    Invoice::create([
                        'customer_id' => $customer->id,
                        'product_id' => $product->id,
                        'quantity' => rand(5, 25),
                        'unit_price' => $product->unit_price,
                        'invoice_date' => now()->subDays(rand(1, 10))->toDateString(),
                        'due_date' => now()->addDays(rand(7, 30))->toDateString(),
                        'status' => collect(['draft', 'sent', 'paid'])->random(),
                        'notes' => 'Sample invoice transaction',
                    ]);
                } catch (\Exception $e) {
                    $this->command->warn("Skipped invoice for {$customer->name} -> {$product->name}: " . $e->getMessage());
                }
            }
        }

        $this->command->info('Sample transactions created successfully!');

        // Show final stock levels
        $this->command->info('Final stock levels:');
        foreach ($materials as $material) {
            $this->command->line("- {$material->name}: {$material->fresh()->stock_quantity} {$material->unit}");
        }

        foreach ($products as $product) {
            $this->command->line("- {$product->name}: {$product->fresh()->stock_quantity} {$product->unit}");
        }
    }
}
