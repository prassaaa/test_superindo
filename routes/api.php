<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\IncomingController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\InvoiceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API Routes for Superindo Management System
Route::prefix('v1')->group(function () {
    
    // Customer Management Routes
    Route::apiResource('customers', CustomerController::class);
    
    // Material Management Routes
    Route::apiResource('materials', MaterialController::class);
    
    // Product Management Routes
    Route::apiResource('products', ProductController::class);
    
    // Incoming Management Routes
    Route::apiResource('incoming', IncomingController::class);
    
    // Production Management Routes
    Route::apiResource('productions', ProductionController::class);
    
    // Invoice Management Routes
    Route::apiResource('invoices', InvoiceController::class);
    
    // Additional Invoice Routes
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'generatePdf'])->name('invoices.pdf');
    Route::patch('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('invoices.status');
    
    // Dashboard/Statistics Routes
    Route::get('dashboard/stats', function () {
        return response()->json([
            'customers' => \App\Models\Customer::count(),
            'materials' => \App\Models\Material::count(),
            'products' => \App\Models\Product::count(),
            'incoming_today' => \App\Models\Incoming::whereDate('created_at', today())->count(),
            'productions_today' => \App\Models\Production::whereDate('created_at', today())->count(),
            'invoices_today' => \App\Models\Invoice::whereDate('created_at', today())->count(),
            'total_incoming_value' => \App\Models\Incoming::sum('total_price'),
            'total_invoice_value' => \App\Models\Invoice::sum('total_price'),
            'low_stock_materials' => \App\Models\Material::where('stock_quantity', '<', 10)->count(),
            'low_stock_products' => \App\Models\Product::where('stock_quantity', '<', 10)->count(),
        ]);
    });
    
    // Stock Report Routes
    Route::get('reports/stock', function () {
        return response()->json([
            'materials' => \App\Models\Material::select('id', 'name', 'code', 'stock_quantity', 'unit')->get(),
            'products' => \App\Models\Product::select('id', 'name', 'code', 'stock_quantity', 'unit')->get(),
        ]);
    });
    
    // Recent Activities Routes
    Route::get('activities/recent', function () {
        $recentIncoming = \App\Models\Incoming::with(['customer', 'material'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'type' => 'incoming',
                    'description' => "Incoming {$item->incoming_number} from {$item->customer->name}",
                    'date' => $item->created_at,
                    'amount' => $item->total_price
                ];
            });
            
        $recentProductions = \App\Models\Production::with(['material', 'product'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'type' => 'production',
                    'description' => "Production {$item->production_number}: {$item->material->name} → {$item->product->name}",
                    'date' => $item->created_at,
                    'amount' => null
                ];
            });
            
        $recentInvoices = \App\Models\Invoice::with(['customer', 'product'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'type' => 'invoice',
                    'description' => "Invoice {$item->invoice_number} to {$item->customer->name}",
                    'date' => $item->created_at,
                    'amount' => $item->total_price
                ];
            });
            
        $activities = collect()
            ->merge($recentIncoming)
            ->merge($recentProductions)
            ->merge($recentInvoices)
            ->sortByDesc('date')
            ->take(10)
            ->values();
            
        return response()->json($activities);
    });
});
