<?php

use App\Models\Customer;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('can get customers list', function () {
    Customer::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->getJson('/api/v1/customers');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'address',
                    'contact_person',
                    'is_active',
                    'created_at',
                    'updated_at'
                ]
            ],
            'current_page',
            'last_page',
            'per_page',
            'total'
        ]);
});

test('can create customer', function () {
    $customerData = [
        'name' => 'Test Customer',
        'email' => 'test@customer.com',
        'phone' => '081234567890',
        'address' => 'Test Address',
        'contact_person' => 'John Doe',
        'is_active' => true,
    ];

    $response = $this->actingAs($this->user)
        ->postJson('/api/v1/customers', $customerData);

    $response->assertStatus(201)
        ->assertJson([
            'message' => 'Customer created successfully',
            'data' => [
                'name' => 'Test Customer',
                'email' => 'test@customer.com'
            ]
        ]);

    $this->assertDatabaseHas('customers', [
        'name' => 'Test Customer',
        'email' => 'test@customer.com'
    ]);
});

test('can update customer', function () {
    $customer = Customer::factory()->create([
        'name' => 'Original Name'
    ]);

    $updateData = [
        'name' => 'Updated Name',
        'email' => 'updated@customer.com',
        'phone' => '081234567890',
        'address' => 'Updated Address',
        'contact_person' => 'Jane Doe',
        'is_active' => true,
    ];

    $response = $this->actingAs($this->user)
        ->putJson("/api/v1/customers/{$customer->id}", $updateData);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Customer updated successfully',
            'data' => [
                'name' => 'Updated Name'
            ]
        ]);

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'name' => 'Updated Name'
    ]);
});

test('can delete customer', function () {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($this->user)
        ->deleteJson("/api/v1/customers/{$customer->id}");

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Customer deleted successfully'
        ]);

    $this->assertDatabaseMissing('customers', [
        'id' => $customer->id
    ]);
});

test('validation fails for invalid customer data', function () {
    $invalidData = [
        'name' => '', // Required field is empty
        'email' => 'invalid-email', // Invalid email format
    ];

    $response = $this->actingAs($this->user)
        ->postJson('/api/v1/customers', $invalidData);

    $response->assertStatus(422)
        ->assertJsonStructure([
            'message',
            'errors' => [
                'name',
                'email'
            ]
        ]);
});
