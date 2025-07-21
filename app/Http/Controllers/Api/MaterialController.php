<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class MaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Material::query();

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

        $materials = $query->orderBy('name')->paginate(15);

        return response()->json($materials);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:materials,code',
                'description' => 'nullable|string',
                'unit' => 'required|string|max:20',
                'stock_quantity' => 'numeric|min:0',
                'unit_price' => 'numeric|min:0',
                'is_active' => 'boolean',
            ]);

            $material = Material::create($validated);

            return response()->json([
                'message' => 'Material created successfully',
                'data' => $material
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Material $material): JsonResponse
    {
        return response()->json([
            'data' => $material->load(['incoming', 'productions'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Material $material): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:materials,code,' . $material->id,
                'description' => 'nullable|string',
                'unit' => 'required|string|max:20',
                'stock_quantity' => 'numeric|min:0',
                'unit_price' => 'numeric|min:0',
                'is_active' => 'boolean',
            ]);

            $material->update($validated);

            return response()->json([
                'message' => 'Material updated successfully',
                'data' => $material
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material): JsonResponse
    {
        try {
            // Check if material has related records
            if ($material->incoming()->count() > 0 || $material->productions()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete material with existing incoming or productions'
                ], 422);
            }

            $material->delete();

            return response()->json([
                'message' => 'Material deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete material',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
