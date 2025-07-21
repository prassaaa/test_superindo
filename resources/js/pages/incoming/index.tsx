import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Incoming, PaginatedResponse, Customer, Material } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { incomingApi, customerApi, materialApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Incoming',
        href: '/incoming',
    },
];

export default function IncomingIndex() {
    const [incoming, setIncoming] = useState<PaginatedResponse<Incoming> | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingIncoming, setEditingIncoming] = useState<Incoming | null>(null);
    const [formData, setFormData] = useState({
        customer_id: '',
        material_id: '',
        quantity: 0,
        unit_price: 0,
        incoming_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const fetchIncoming = async (searchTerm = '') => {
        try {
            setLoading(true);
            const response = await incomingApi.getAll({ search: searchTerm });
            setIncoming(response.data);
        } catch (error) {
            console.error('Failed to fetch incoming:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomersAndMaterials = async () => {
        try {
            const [customersResponse, materialsResponse] = await Promise.all([
                customerApi.getAll({ active: true }),
                materialApi.getAll({ active: true }),
            ]);
            setCustomers(customersResponse.data.data);
            setMaterials(materialsResponse.data.data);
        } catch (error) {
            console.error('Failed to fetch customers and materials:', error);
        }
    };

    useEffect(() => {
        fetchIncoming();
        fetchCustomersAndMaterials();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchIncoming(search);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                customer_id: parseInt(formData.customer_id),
                material_id: parseInt(formData.material_id),
            };

            if (editingIncoming) {
                await incomingApi.update(editingIncoming.id, submitData);
            } else {
                await incomingApi.create(submitData);
            }
            setShowForm(false);
            setEditingIncoming(null);
            setFormData({
                customer_id: '',
                material_id: '',
                quantity: 0,
                unit_price: 0,
                incoming_date: new Date().toISOString().split('T')[0],
                notes: '',
            });
            fetchIncoming(search);
        } catch (error) {
            console.error('Failed to save incoming:', error);
        }
    };

    const handleEdit = (incomingItem: Incoming) => {
        setEditingIncoming(incomingItem);
        setFormData({
            customer_id: incomingItem.customer_id.toString(),
            material_id: incomingItem.material_id.toString(),
            quantity: incomingItem.quantity,
            unit_price: incomingItem.unit_price,
            incoming_date: incomingItem.incoming_date,
            notes: incomingItem.notes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (incomingItem: Incoming) => {
        if (confirm(`Are you sure you want to delete incoming ${incomingItem.incoming_number}?`)) {
            try {
                await incomingApi.delete(incomingItem.id);
                fetchIncoming(search);
            } catch (error) {
                console.error('Failed to delete incoming:', error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incoming" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Incoming Materials</h1>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Incoming
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search incoming..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="outline">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>

                {/* Incoming Form */}
                {showForm && (
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingIncoming ? 'Edit Incoming' : 'Add New Incoming'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Customer *</label>
                                    <Select
                                        required
                                        value={formData.customer_id}
                                        onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Material *</label>
                                    <Select
                                        required
                                        value={formData.material_id}
                                        onValueChange={(value) => setFormData({ ...formData, material_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Material" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {materials.map((material) => (
                                                <SelectItem key={material.id} value={material.id.toString()}>
                                                    {material.name} ({material.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit Price *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Incoming Date *</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.incoming_date}
                                        onChange={(e) => setFormData({ ...formData, incoming_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Price</label>
                                    <Input
                                        type="text"
                                        disabled
                                        value={`Rp ${Math.round(formData.quantity * formData.unit_price).toLocaleString('id-ID')}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    className="border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingIncoming ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingIncoming(null);
                                        setFormData({
                                            customer_id: '',
                                            material_id: '',
                                            quantity: 0,
                                            unit_price: 0,
                                            incoming_date: new Date().toISOString().split('T')[0],
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

                {/* Incoming Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left p-4">Incoming #</th>
                                        <th className="text-left p-4">Customer</th>
                                        <th className="text-left p-4">Material</th>
                                        <th className="text-left p-4">Quantity</th>
                                        <th className="text-left p-4">Unit Price</th>
                                        <th className="text-left p-4">Total</th>
                                        <th className="text-left p-4">Date</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incoming?.data.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-4 font-medium">{item.incoming_number}</td>
                                            <td className="p-4">{item.customer?.name}</td>
                                            <td className="p-4">{item.material?.name}</td>
                                            <td className="p-4">{Math.round(item.quantity)} {item.material?.unit}</td>
                                            <td className="p-4">Rp {Math.round(item.unit_price).toLocaleString('id-ID')}</td>
                                            <td className="p-4">Rp {Math.round(item.total_price).toLocaleString('id-ID')}</td>
                                            <td className="p-4">{new Date(item.incoming_date).toLocaleDateString('id-ID')}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {incoming?.data.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground">
                                    No incoming records found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
