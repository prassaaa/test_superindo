import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Customer, PaginatedResponse } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Customers',
        href: '/customers',
    },
];

export default function CustomersIndex() {
    const [customers, setCustomers] = useState<PaginatedResponse<Customer> | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        is_active: true,
    });

    const fetchCustomers = async (searchTerm = '') => {
        try {
            setLoading(true);
            const response = await customerApi.getAll({ search: searchTerm });
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers(search);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customerApi.update(editingCustomer.id, formData);
            } else {
                await customerApi.create(formData);
            }
            setShowForm(false);
            setEditingCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                contact_person: '',
                is_active: true,
            });
            fetchCustomers(search);
        } catch (error) {
            console.error('Failed to save customer:', error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            contact_person: customer.contact_person || '',
            is_active: customer.is_active,
        });
        setShowForm(true);
    };

    const handleDelete = async (customer: Customer) => {
        if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
            try {
                await customerApi.delete(customer.id);
                fetchCustomers(search);
            } catch (error) {
                console.error('Failed to delete customer:', error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Customer
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="outline">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>

                {/* Customer Form */}
                {showForm && (
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact Person</label>
                                    <Input
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                                    {editingCustomer ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingCustomer(null);
                                        setFormData({
                                            name: '',
                                            email: '',
                                            phone: '',
                                            address: '',
                                            contact_person: '',
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

                {/* Customers Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Email</th>
                                        <th className="text-left p-4">Phone</th>
                                        <th className="text-left p-4">Contact Person</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers?.data.map((customer) => (
                                        <tr key={customer.id} className="border-b">
                                            <td className="p-4 font-medium">{customer.name}</td>
                                            <td className="p-4">{customer.email || '-'}</td>
                                            <td className="p-4">{customer.phone || '-'}</td>
                                            <td className="p-4">{customer.contact_person || '-'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    customer.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {customer.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(customer)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {customers?.data.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground">
                                    No customers found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
