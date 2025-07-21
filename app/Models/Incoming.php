<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Incoming extends Model
{
    protected $table = 'incoming';

    protected $fillable = [
        'incoming_number',
        'customer_id',
        'material_id',
        'quantity',
        'unit_price',
        'total_price',
        'incoming_date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'incoming_date' => 'date',
    ];

    /**
     * Get the customer that sent this material
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the material that came in
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($incoming) {
            if (empty($incoming->incoming_number)) {
                $incoming->incoming_number = static::generateIncomingNumber();
            }
            $incoming->total_price = $incoming->quantity * $incoming->unit_price;
        });

        static::updating(function ($incoming) {
            $incoming->total_price = $incoming->quantity * $incoming->unit_price;
        });

        static::created(function ($incoming) {
            // Add stock to material when incoming is created
            $incoming->material->addStock($incoming->quantity);
        });
    }

    /**
     * Generate unique incoming number
     */
    public static function generateIncomingNumber(): string
    {
        $date = now()->format('Ymd');
        $lastIncoming = static::where('incoming_number', 'like', 'IN' . $date . '%')
                             ->orderBy('incoming_number', 'desc')
                             ->first();

        $sequence = 1;
        if ($lastIncoming) {
            $lastSequence = (int) substr($lastIncoming->incoming_number, -4);
            $sequence = $lastSequence + 1;
        }

        return 'IN' . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
