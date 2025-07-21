<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['customer', 'product']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($search) {
                      $customerQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('product', function ($productQuery) use ($search) {
                      $productQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('invoice_date', '>=', $request->get('start_date'));
        }
        if ($request->has('end_date')) {
            $query->whereDate('invoice_date', '<=', $request->get('end_date'));
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->get('customer_id'));
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->get('product_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $invoices = $query->orderBy('invoice_date', 'desc')->paginate(15);

        return response()->json($invoices);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|numeric|min:0.01',
                'unit_price' => 'required|numeric|min:0',
                'invoice_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:invoice_date',
                'status' => 'in:draft,sent,paid,cancelled',
                'notes' => 'nullable|string',
            ]);

            $invoice = Invoice::create($validated);
            $invoice->load(['customer', 'product']);

            return response()->json([
                'message' => 'Invoice created successfully',
                'data' => $invoice
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json([
            'data' => $invoice->load(['customer', 'product'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|numeric|min:0.01',
                'unit_price' => 'required|numeric|min:0',
                'invoice_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:invoice_date',
                'status' => 'in:draft,sent,paid,cancelled',
                'notes' => 'nullable|string',
            ]);

            // Calculate the difference in quantity to adjust stock
            $oldQuantity = $invoice->quantity;
            $newQuantity = $validated['quantity'];
            $quantityDifference = $newQuantity - $oldQuantity;

            // Check if there's enough product stock for increased quantity
            if ($quantityDifference > 0 && !$invoice->product->hasEnoughStock($quantityDifference)) {
                throw new \Exception("Insufficient product stock. Available: {$invoice->product->stock_quantity}, Additional Required: {$quantityDifference}");
            }

            // Update the invoice record
            $invoice->update($validated);

            // Adjust product stock if quantity changed
            if ($quantityDifference != 0) {
                if ($quantityDifference > 0) {
                    $invoice->product->reduceStock($quantityDifference);
                } else {
                    $invoice->product->addStock(abs($quantityDifference));
                }
            }

            $invoice->load(['customer', 'product']);

            return response()->json([
                'message' => 'Invoice updated successfully',
                'data' => $invoice
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        try {
            // Add product stock back when deleting invoice
            $invoice->product->addStock($invoice->quantity);

            $invoice->delete();

            return response()->json([
                'message' => 'Invoice deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF for the invoice
     */
    public function generatePdf(Invoice $invoice)
    {
        try {
            $invoice->load(['customer', 'product']);

            $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));

            return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update invoice status
     */
    public function updateStatus(Request $request, Invoice $invoice): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:draft,sent,paid,cancelled',
            ]);

            $invoice->update($validated);

            return response()->json([
                'message' => 'Invoice status updated successfully',
                'data' => $invoice
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update invoice status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
