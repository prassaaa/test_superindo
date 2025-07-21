<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $products = $query->orderBy('name')->paginate(15);

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:products,code',
                'description' => 'nullable|string',
                'unit' => 'required|string|max:20',
                'stock_quantity' => 'numeric|min:0',
                'unit_price' => 'numeric|min:0',
                'is_active' => 'boolean',
            ]);

            $product = Product::create($validated);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $product->load(['productions', 'invoices'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:products,code,' . $product->id,
                'description' => 'nullable|string',
                'unit' => 'required|string|max:20',
                'stock_quantity' => 'numeric|min:0',
                'unit_price' => 'numeric|min:0',
                'is_active' => 'boolean',
            ]);

            $product->update($validated);

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        try {
            // Check if product has related records
            if ($product->productions()->count() > 0 || $product->invoices()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete product with existing productions or invoices'
                ], 422);
            }

            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
