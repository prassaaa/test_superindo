<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'unit',
        'stock_quantity',
        'unit_price',
        'is_active',
    ];

    protected $casts = [
        'stock_quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get all incoming records for this material
     */
    public function incoming(): HasMany
    {
        return $this->hasMany(Incoming::class);
    }

    /**
     * Get all productions that use this material
     */
    public function productions(): HasMany
    {
        return $this->hasMany(Production::class);
    }

    /**
     * Scope to get only active materials
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Add stock when materials come in
     */
    public function addStock($quantity)
    {
        $this->increment('stock_quantity', $quantity);
    }

    /**
     * Reduce stock when materials are used in production
     */
    public function reduceStock($quantity)
    {
        if ($this->stock_quantity < $quantity) {
            throw new \Exception("Insufficient stock. Available: {$this->stock_quantity}, Required: {$quantity}");
        }
        $this->decrement('stock_quantity', $quantity);
    }

    /**
     * Check if there's enough stock
     */
    public function hasEnoughStock($quantity): bool
    {
        return $this->stock_quantity >= $quantity;
    }
}
