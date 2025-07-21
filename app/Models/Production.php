<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Production extends Model
{
    protected $fillable = [
        'production_number',
        'material_id',
        'product_id',
        'material_quantity_used',
        'product_quantity_produced',
        'production_date',
        'notes',
    ];

    protected $casts = [
        'material_quantity_used' => 'decimal:2',
        'product_quantity_produced' => 'decimal:2',
        'production_date' => 'date',
    ];

    /**
     * Get the material used in this production
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    /**
     * Get the product produced in this production
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

        static::creating(function ($production) {
            if (empty($production->production_number)) {
                $production->production_number = static::generateProductionNumber();
            }

            // Check if there's enough material stock
            if (!$production->material->hasEnoughStock($production->material_quantity_used)) {
                throw new \Exception("Insufficient material stock. Available: {$production->material->stock_quantity}, Required: {$production->material_quantity_used}");
            }
        });

        static::created(function ($production) {
            // Reduce material stock and add product stock
            $production->material->reduceStock($production->material_quantity_used);
            $production->product->addStock($production->product_quantity_produced);
        });
    }

    /**
     * Generate unique production number
     */
    public static function generateProductionNumber(): string
    {
        $date = now()->format('Ymd');
        $lastProduction = static::where('production_number', 'like', 'PR' . $date . '%')
                               ->orderBy('production_number', 'desc')
                               ->first();

        $sequence = 1;
        if ($lastProduction) {
            $lastSequence = (int) substr($lastProduction->production_number, -4);
            $sequence = $lastSequence + 1;
        }

        return 'PR' . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
