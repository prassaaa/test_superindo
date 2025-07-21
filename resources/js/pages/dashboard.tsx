import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, DashboardStats, Activity } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, activitiesResponse] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getRecentActivities(),
                ]);
                setStats(statsResponse.data);
                setActivities(activitiesResponse.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="text-center">Loading...</div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Customers</h3>
                        <p className="text-2xl font-bold">{stats?.customers || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Materials</h3>
                        <p className="text-2xl font-bold">{stats?.materials || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
                        <p className="text-2xl font-bold">{stats?.products || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Invoices Today</h3>
                        <p className="text-2xl font-bold">{stats?.invoices_today || 0}</p>
                    </div>
                </div>

                {/* Today's Activities and Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Today's Activities</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Incoming</span>
                                <span className="font-semibold">{stats?.incoming_today || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Productions</span>
                                <span className="font-semibold">{stats?.productions_today || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Invoices</span>
                                <span className="font-semibold">{stats?.invoices_today || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Stock Alerts</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Low Stock Materials</span>
                                <span className="font-semibold text-red-600">{stats?.low_stock_materials || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Low Stock Products</span>
                                <span className="font-semibold text-red-600">{stats?.low_stock_products || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Incoming</span>
                                <span className="font-semibold text-sm">Rp {Math.round(stats?.total_incoming_value || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Invoice</span>
                                <span className="font-semibold text-sm">Rp {Math.round(stats?.total_invoice_value || 0).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                    <div>
                                        <p className="text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.date).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    {activity.amount && (
                                        <span className="text-sm font-semibold">
                                            Rp {Math.round(activity.amount).toLocaleString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No recent activities</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
