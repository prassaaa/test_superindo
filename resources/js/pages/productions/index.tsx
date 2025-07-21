import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Production, PaginatedResponse, Material, Product } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { productionApi, materialApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Productions',
        href: '/productions',
    },
];

export default function ProductionsIndex() {
    const [productions, setProductions] = useState<PaginatedResponse<Production> | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduction, setEditingProduction] = useState<Production | null>(null);
    const [formData, setFormData] = useState({
        material_id: '',
        product_id: '',
        material_quantity_used: 0,
        product_quantity_produced: 0,
        production_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const fetchProductions = async (searchTerm = '') => {
        try {
            setLoading(true);
            const response = await productionApi.getAll({ search: searchTerm });
            setProductions(response.data);
        } catch (error) {
            console.error('Failed to fetch productions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterialsAndProducts = async () => {
        try {
            const [materialsResponse, productsResponse] = await Promise.all([
                materialApi.getAll({ active: true }),
                productApi.getAll({ active: true }),
            ]);
            setMaterials(materialsResponse.data.data);
            setProducts(productsResponse.data.data);
        } catch (error) {
            console.error('Failed to fetch materials and products:', error);
        }
    };

    useEffect(() => {
        fetchProductions();
        fetchMaterialsAndProducts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProductions(search);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                material_id: parseInt(formData.material_id),
                product_id: parseInt(formData.product_id),
            };

            if (editingProduction) {
                await productionApi.update(editingProduction.id, submitData);
            } else {
                await productionApi.create(submitData);
            }
            setShowForm(false);
            setEditingProduction(null);
            setFormData({
                material_id: '',
                product_id: '',
                material_quantity_used: 0,
                product_quantity_produced: 0,
                production_date: new Date().toISOString().split('T')[0],
                notes: '',
            });
            fetchProductions(search);
        } catch (error) {
            console.error('Failed to save production:', error);
            alert('Failed to save production. Please check if there is enough material stock.');
        }
    };

    const handleEdit = (production: Production) => {
        setEditingProduction(production);
        setFormData({
            material_id: production.material_id.toString(),
            product_id: production.product_id.toString(),
            material_quantity_used: production.material_quantity_used,
            product_quantity_produced: production.product_quantity_produced,
            production_date: production.production_date,
            notes: production.notes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (production: Production) => {
        if (confirm(`Are you sure you want to delete production ${production.production_number}?`)) {
            try {
                await productionApi.delete(production.id);
                fetchProductions(search);
            } catch (error) {
                console.error('Failed to delete production:', error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Productions</h1>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Production
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search productions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="outline">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>

                {/* Production Form */}
                {showForm && (
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingProduction ? 'Edit Production' : 'Add New Production'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Material *</label>
                                    <select
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={formData.material_id}
                                        onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
                                    >
                                        <option value="">Select Material</option>
                                        {materials.map((material) => (
                                            <option key={material.id} value={material.id}>
                                                {material.name} (Stock: {Math.round(material.stock_quantity)} {material.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product *</label>
                                    <select
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={formData.product_id}
                                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} ({product.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Material Quantity Used *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={formData.material_quantity_used}
                                        onChange={(e) => setFormData({ ...formData, material_quantity_used: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Quantity Produced *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={formData.product_quantity_produced}
                                        onChange={(e) => setFormData({ ...formData, product_quantity_produced: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Production Date *</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.production_date}
                                        onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingProduction ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingProduction(null);
                                        setFormData({
                                            material_id: '',
                                            product_id: '',
                                            material_quantity_used: 0,
                                            product_quantity_produced: 0,
                                            production_date: new Date().toISOString().split('T')[0],
                                            notes: '',
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Productions Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left p-4">Production #</th>
                                        <th className="text-left p-4">Material</th>
                                        <th className="text-left p-4">Product</th>
                                        <th className="text-left p-4">Material Used</th>
                                        <th className="text-left p-4">Product Produced</th>
                                        <th className="text-left p-4">Date</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productions?.data.map((production) => (
                                        <tr key={production.id} className="border-b">
                                            <td className="p-4 font-medium">{production.production_number}</td>
                                            <td className="p-4">{production.material?.name}</td>
                                            <td className="p-4">{production.product?.name}</td>
                                            <td className="p-4">{Math.round(production.material_quantity_used)} {production.material?.unit}</td>
                                            <td className="p-4">{Math.round(production.product_quantity_produced)} {production.product?.unit}</td>
                                            <td className="p-4">{new Date(production.production_date).toLocaleDateString('id-ID')}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(production)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(production)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {productions?.data.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground">
                                    No production records found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
