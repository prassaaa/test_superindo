<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'customer_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
        'invoice_date',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'invoice_date' => 'date',
        'due_date' => 'date',
    ];

    /**
     * Get the customer for this invoice
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the product in this invoice
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::generateInvoiceNumber();
            }
            $invoice->total_price = $invoice->quantity * $invoice->unit_price;

            // Check if there's enough product stock
            if (!$invoice->product->hasEnoughStock($invoice->quantity)) {
                throw new \Exception("Insufficient product stock. Available: {$invoice->product->stock_quantity}, Required: {$invoice->quantity}");
            }
        });

        static::updating(function ($invoice) {
            $invoice->total_price = $invoice->quantity * $invoice->unit_price;
        });

        static::created(function ($invoice) {
            // Reduce product stock when invoice is created
            $invoice->product->reduceStock($invoice->quantity);
        });
    }

    /**
     * Generate unique invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $lastInvoice = static::where('invoice_number', 'like', 'INV' . $date . '%')
                            ->orderBy('invoice_number', 'desc')
                            ->first();

        $sequence = 1;
        if ($lastInvoice) {
            $lastSequence = (int) substr($lastInvoice->invoice_number, -4);
            $sequence = $lastSequence + 1;
        }

        return 'INV' . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope to get invoices by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
