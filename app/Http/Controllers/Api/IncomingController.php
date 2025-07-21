<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incoming;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class IncomingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Incoming::with(['customer', 'material']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('incoming_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($search) {
                      $customerQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('material', function ($materialQuery) use ($search) {
                      $materialQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('incoming_date', '>=', $request->get('start_date'));
        }
        if ($request->has('end_date')) {
            $query->whereDate('incoming_date', '<=', $request->get('end_date'));
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->get('customer_id'));
        }

        // Filter by material
        if ($request->has('material_id')) {
            $query->where('material_id', $request->get('material_id'));
        }

        $incoming = $query->orderBy('incoming_date', 'desc')->paginate(15);

        return response()->json($incoming);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'material_id' => 'required|exists:materials,id',
                'quantity' => 'required|numeric|min:0.01',
                'unit_price' => 'required|numeric|min:0',
                'incoming_date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            $incoming = Incoming::create($validated);
            $incoming->load(['customer', 'material']);

            return response()->json([
                'message' => 'Incoming record created successfully',
                'data' => $incoming
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create incoming record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Incoming $incoming): JsonResponse
    {
        return response()->json([
            'data' => $incoming->load(['customer', 'material'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Incoming $incoming): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'material_id' => 'required|exists:materials,id',
                'quantity' => 'required|numeric|min:0.01',
                'unit_price' => 'required|numeric|min:0',
                'incoming_date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            // Calculate the difference in quantity to adjust stock
            $oldQuantity = $incoming->quantity;
            $newQuantity = $validated['quantity'];
            $quantityDifference = $newQuantity - $oldQuantity;

            // Update the incoming record
            $incoming->update($validated);

            // Adjust material stock if quantity changed
            if ($quantityDifference != 0) {
                $incoming->material->addStock($quantityDifference);
            }

            $incoming->load(['customer', 'material']);

            return response()->json([
                'message' => 'Incoming record updated successfully',
                'data' => $incoming
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update incoming record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Incoming $incoming): JsonResponse
    {
        try {
            // Reduce material stock when deleting incoming record
            $incoming->material->reduceStock($incoming->quantity);

            $incoming->delete();

            return response()->json([
                'message' => 'Incoming record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete incoming record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
