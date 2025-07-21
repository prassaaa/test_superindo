import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    contact_person?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Material {
    id: number;
    name: string;
    code: string;
    description?: string;
    unit: string;
    stock_quantity: number;
    unit_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    code: string;
    description?: string;
    unit: string;
    stock_quantity: number;
    unit_price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Incoming {
    id: number;
    incoming_number: string;
    customer_id: number;
    material_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    incoming_date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    material?: Material;
}

export interface Production {
    id: number;
    production_number: string;
    material_id: number;
    product_id: number;
    material_quantity_used: number;
    product_quantity_produced: number;
    production_date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    material?: Material;
    product?: Product;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    invoice_date: string;
    due_date?: string;
    status: 'draft' | 'sent' | 'paid' | 'cancelled';
    notes?: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    product?: Product;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface DashboardStats {
    customers: number;
    materials: number;
    products: number;
    incoming_today: number;
    productions_today: number;
    invoices_today: number;
    total_incoming_value: number;
    total_invoice_value: number;
    low_stock_materials: number;
    low_stock_products: number;
}

export interface Activity {
    type: 'incoming' | 'production' | 'invoice';
    description: string;
    date: string;
    amount?: number;
}
