<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Production;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ProductionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Production::with(['material', 'product']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('production_number', 'like', "%{$search}%")
                  ->orWhereHas('material', function ($materialQuery) use ($search) {
                      $materialQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('product', function ($productQuery) use ($search) {
                      $productQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('production_date', '>=', $request->get('start_date'));
        }
        if ($request->has('end_date')) {
            $query->whereDate('production_date', '<=', $request->get('end_date'));
        }

        // Filter by material
        if ($request->has('material_id')) {
            $query->where('material_id', $request->get('material_id'));
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->get('product_id'));
        }

        $productions = $query->orderBy('production_date', 'desc')->paginate(15);

        return response()->json($productions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'material_id' => 'required|exists:materials,id',
                'product_id' => 'required|exists:products,id',
                'material_quantity_used' => 'required|numeric|min:0.01',
                'product_quantity_produced' => 'required|numeric|min:0.01',
                'production_date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            $production = Production::create($validated);
            $production->load(['material', 'product']);

            return response()->json([
                'message' => 'Production record created successfully',
                'data' => $production
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create production record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Production $production): JsonResponse
    {
        return response()->json([
            'data' => $production->load(['material', 'product'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Production $production): JsonResponse
    {
        try {
            $validated = $request->validate([
                'material_id' => 'required|exists:materials,id',
                'product_id' => 'required|exists:products,id',
                'material_quantity_used' => 'required|numeric|min:0.01',
                'product_quantity_produced' => 'required|numeric|min:0.01',
                'production_date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            // Revert the previous stock changes
            $production->material->addStock($production->material_quantity_used);
            $production->product->reduceStock($production->product_quantity_produced);

            // Check if there's enough material stock for the new quantity
            if (!$production->material->hasEnoughStock($validated['material_quantity_used'])) {
                throw new \Exception("Insufficient material stock. Available: {$production->material->stock_quantity}, Required: {$validated['material_quantity_used']}");
            }

            // Update the production record
            $production->update($validated);

            // Apply new stock changes
            $production->material->reduceStock($validated['material_quantity_used']);
            $production->product->addStock($validated['product_quantity_produced']);

            $production->load(['material', 'product']);

            return response()->json([
                'message' => 'Production record updated successfully',
                'data' => $production
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update production record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Production $production): JsonResponse
    {
        try {
            // Revert stock changes when deleting production record
            $production->material->addStock($production->material_quantity_used);
            $production->product->reduceStock($production->product_quantity_produced);

            $production->delete();

            return response()->json([
                'message' => 'Production record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete production record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
