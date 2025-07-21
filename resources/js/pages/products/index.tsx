import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Product, PaginatedResponse } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Products',
        href: '/products',
    },
];

export default function ProductsIndex() {
    const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        unit: '',
        stock_quantity: 0,
        unit_price: 0,
        is_active: true,
    });

    const fetchProducts = async (searchTerm = '') => {
        try {
            setLoading(true);
            const response = await productApi.getAll({ search: searchTerm });
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts(search);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productApi.update(editingProduct.id, formData);
            } else {
                await productApi.create(formData);
            }
            setShowForm(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                code: '',
                description: '',
                unit: '',
                stock_quantity: 0,
                unit_price: 0,
                is_active: true,
            });
            fetchProducts(search);
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            code: product.code,
            description: product.description || '',
            unit: product.unit,
            stock_quantity: product.stock_quantity,
            unit_price: product.unit_price,
            is_active: product.is_active,
        });
        setShowForm(true);
    };

    const handleDelete = async (product: Product) => {
        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
            try {
                await productApi.delete(product.id);
                fetchProducts(search);
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="outline">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>

                {/* Product Form */}
                {showForm && (
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name *</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Code *</label>
                                    <Input
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit *</label>
                                    <Input
                                        required
                                        placeholder="kg, liter, pcs, etc."
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit Price</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingProduct ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingProduct(null);
                                        setFormData({
                                            name: '',
                                            code: '',
                                            description: '',
                                            unit: '',
                                            stock_quantity: 0,
                                            unit_price: 0,
                                            is_active: true,
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Code</th>
                                        <th className="text-left p-4">Unit</th>
                                        <th className="text-left p-4">Stock</th>
                                        <th className="text-left p-4">Unit Price</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products?.data.map((product) => (
                                        <tr key={product.id} className="border-b">
                                            <td className="p-4 font-medium">{product.name}</td>
                                            <td className="p-4">{product.code}</td>
                                            <td className="p-4">{product.unit}</td>
                                            <td className="p-4">
                                                <span className={product.stock_quantity < 10 ? 'text-red-600 font-semibold' : ''}>
                                                    {Math.round(product.stock_quantity)}
                                                </span>
                                            </td>
                                            <td className="p-4">Rp {Math.round(product.unit_price).toLocaleString('id-ID')}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {products?.data.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground">
                                    No products found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
