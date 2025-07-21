import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Invoice, PaginatedResponse, Customer, Product } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { invoiceApi, customerApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, FileText, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Invoices',
        href: '/invoices',
    },
];

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function InvoicesIndex() {
    const [invoices, setInvoices] = useState<PaginatedResponse<Invoice> | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [formData, setFormData] = useState({
        customer_id: '',
        product_id: '',
        quantity: 0,
        unit_price: 0,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'draft' as const,
        notes: '',
    });

    const fetchInvoices = async (searchTerm = '') => {
        try {
            setLoading(true);
            const response = await invoiceApi.getAll({ search: searchTerm });
            setInvoices(response.data);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomersAndProducts = async () => {
        try {
            const [customersResponse, productsResponse] = await Promise.all([
                customerApi.getAll({ active: true }),
                productApi.getAll({ active: true }),
            ]);
            setCustomers(customersResponse.data.data);
            setProducts(productsResponse.data.data);
        } catch (error) {
            console.error('Failed to fetch customers and products:', error);
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchCustomersAndProducts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInvoices(search);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                customer_id: parseInt(formData.customer_id),
                product_id: parseInt(formData.product_id),
                due_date: formData.due_date || null,
            };

            if (editingInvoice) {
                await invoiceApi.update(editingInvoice.id, submitData);
            } else {
                await invoiceApi.create(submitData);
            }
            setShowForm(false);
            setEditingInvoice(null);
            setFormData({
                customer_id: '',
                product_id: '',
                quantity: 0,
                unit_price: 0,
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: '',
                status: 'draft',
                notes: '',
            });
            fetchInvoices(search);
        } catch (error) {
            console.error('Failed to save invoice:', error);
            alert('Failed to save invoice. Please check if there is enough product stock.');
        }
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setFormData({
            customer_id: invoice.customer_id.toString(),
            product_id: invoice.product_id.toString(),
            quantity: invoice.quantity,
            unit_price: invoice.unit_price,
            invoice_date: invoice.invoice_date,
            due_date: invoice.due_date || '',
            status: invoice.status,
            notes: invoice.notes || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (invoice: Invoice) => {
        if (confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
            try {
                await invoiceApi.delete(invoice.id);
                fetchInvoices(search);
            } catch (error) {
                console.error('Failed to delete invoice:', error);
            }
        }
    };

    const handleDownloadPdf = async (invoice: Invoice) => {
        try {
            const response = await invoiceApi.generatePdf(invoice.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download PDF:', error);
        }
    };

    const handleStatusChange = async (invoice: Invoice, newStatus: string) => {
        try {
            await invoiceApi.updateStatus(invoice.id, newStatus);
            fetchInvoices(search);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Invoice
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="Search invoices..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit" variant="outline">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>

                {/* Invoice Form */}
                {showForm && (
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}
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
                                    <label className="block text-sm font-medium mb-1">Product *</label>
                                    <Select
                                        required
                                        value={formData.product_id}
                                        onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.name} (Stock: {Math.round(product.stock_quantity)} {product.unit})
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
                                    <label className="block text-sm font-medium mb-1">Invoice Date *</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.invoice_date}
                                        onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date</label>
                                    <Input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    {editingInvoice ? 'Update' : 'Create'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingInvoice(null);
                                        setFormData({
                                            customer_id: '',
                                            product_id: '',
                                            quantity: 0,
                                            unit_price: 0,
                                            invoice_date: new Date().toISOString().split('T')[0],
                                            due_date: '',
                                            status: 'draft',
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

                {/* Invoices Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-center">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left p-4">Invoice #</th>
                                        <th className="text-left p-4">Customer</th>
                                        <th className="text-left p-4">Product</th>
                                        <th className="text-left p-4">Quantity</th>
                                        <th className="text-left p-4">Total</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Date</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices?.data.map((invoice) => (
                                        <tr key={invoice.id} className="border-b">
                                            <td className="p-4 font-medium">{invoice.invoice_number}</td>
                                            <td className="p-4">{invoice.customer?.name}</td>
                                            <td className="p-4">{invoice.product?.name}</td>
                                            <td className="p-4">{Math.round(invoice.quantity)} {invoice.product?.unit}</td>
                                            <td className="p-4">Rp {Math.round(invoice.total_price).toLocaleString('id-ID')}</td>
                                            <td className="p-4">
                                                <Select
                                                    value={invoice.status}
                                                    onValueChange={(value) => handleStatusChange(invoice, value)}
                                                >
                                                    <SelectTrigger className={`w-auto px-2 py-1 h-auto rounded-full text-xs border-none ${statusColors[invoice.status]}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="sent">Sent</SelectItem>
                                                        <SelectItem value="paid">Paid</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-4">{new Date(invoice.invoice_date).toLocaleDateString('id-ID')}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownloadPdf(invoice)}
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(invoice)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(invoice)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {invoices?.data.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground">
                                    No invoices found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
