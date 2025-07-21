<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
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
     * Get all productions that produce this product
     */
    public function productions(): HasMany
    {
        return $this->hasMany(Production::class);
    }

    /**
     * Get all invoices for this product
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Scope to get only active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Add stock when products are produced
     */
    public function addStock($quantity)
    {
        $this->increment('stock_quantity', $quantity);
    }

    /**
     * Reduce stock when products are sold
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
