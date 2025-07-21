<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Master Data Routes
    Route::get('customers', function () {
        return Inertia::render('customers/index');
    })->name('customers.index');

    Route::get('materials', function () {
        return Inertia::render('materials/index');
    })->name('materials.index');

    Route::get('products', function () {
        return Inertia::render('products/index');
    })->name('products.index');

    // Transaction Routes
    Route::get('incoming', function () {
        return Inertia::render('incoming/index');
    })->name('incoming.index');

    Route::get('productions', function () {
        return Inertia::render('productions/index');
    })->name('productions.index');

    Route::get('invoices', function () {
        return Inertia::render('invoices/index');
    })->name('invoices.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
