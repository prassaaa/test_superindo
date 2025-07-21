<?php

use App\Models\Customer;
use App\Models\Material;
use App\Models\Product;
use App\Models\Incoming;
use App\Models\Production;
use App\Models\Invoice;

test('incoming increases material stock', function () {
    $customer = Customer::factory()->create();
    $material = Material::factory()->create(['stock_quantity' => 100]);

    $incoming = Incoming::create([
        'customer_id' => $customer->id,
        'material_id' => $material->id,
        'quantity' => 50,
        'unit_price' => 10000,
        'incoming_date' => now()->toDateString(),
    ]);

    $material->refresh();
    expect($material->stock_quantity)->toBe(150.0);
});

test('production decreases material stock and increases product stock', function () {
    $material = Material::factory()->create(['stock_quantity' => 100]);
    $product = Product::factory()->create(['stock_quantity' => 50]);

    $production = Production::create([
        'material_id' => $material->id,
        'product_id' => $product->id,
        'material_quantity_used' => 30,
        'product_quantity_produced' => 20,
        'production_date' => now()->toDateString(),
    ]);

    $material->refresh();
    $product->refresh();

    expect($material->stock_quantity)->toBe(70.0);
    expect($product->stock_quantity)->toBe(70.0);
});

test('invoice decreases product stock', function () {
    $customer = Customer::factory()->create();
    $product = Product::factory()->create(['stock_quantity' => 100]);

    $invoice = Invoice::create([
        'customer_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 25,
        'unit_price' => 15000,
        'invoice_date' => now()->toDateString(),
    ]);

    $product->refresh();
    expect($product->stock_quantity)->toBe(75.0);
});

test('production fails when insufficient material stock', function () {
    $material = Material::factory()->create(['stock_quantity' => 10]);
    $product = Product::factory()->create(['stock_quantity' => 50]);

    expect(function () use ($material, $product) {
        Production::create([
            'material_id' => $material->id,
            'product_id' => $product->id,
            'material_quantity_used' => 20, // More than available stock
            'product_quantity_produced' => 15,
            'production_date' => now()->toDateString(),
        ]);
    })->toThrow(Exception::class, 'Insufficient material stock');
});

test('invoice fails when insufficient product stock', function () {
    $customer = Customer::factory()->create();
    $product = Product::factory()->create(['stock_quantity' => 10]);

    expect(function () use ($customer, $product) {
        Invoice::create([
            'customer_id' => $customer->id,
            'product_id' => $product->id,
            'quantity' => 20, // More than available stock
            'unit_price' => 15000,
            'invoice_date' => now()->toDateString(),
        ]);
    })->toThrow(Exception::class, 'Insufficient product stock');
});

test('material has enough stock method works correctly', function () {
    $material = Material::factory()->create(['stock_quantity' => 100]);

    expect($material->hasEnoughStock(50))->toBeTrue();
    expect($material->hasEnoughStock(100))->toBeTrue();
    expect($material->hasEnoughStock(150))->toBeFalse();
});

test('product has enough stock method works correctly', function () {
    $product = Product::factory()->create(['stock_quantity' => 75]);

    expect($product->hasEnoughStock(25))->toBeTrue();
    expect($product->hasEnoughStock(75))->toBeTrue();
    expect($product->hasEnoughStock(100))->toBeFalse();
});
