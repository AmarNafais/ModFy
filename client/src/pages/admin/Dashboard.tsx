import { useQuery } from "@tanstack/react-query";
import { AdminStats } from "@/components/admin/AdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, TrendingUp, Users } from "lucide-react";

export default function Dashboard() {
    const { data: users = [] } = useQuery({
        queryKey: ["/api/admin/users"],
    });

    const { data: orders = [] } = useQuery({
        queryKey: ["/api/admin/orders"],
    });

    const { data: products = [] } = useQuery({
        queryKey: ["/api/products"],
    });

    const totalRevenue = Array.isArray(orders)
        ? orders.reduce((sum: number, order: any) => {
            const total = parseFloat(order.total_amount || order.totalAmount || 0);
            return sum + total;
        }, 0)
        : 0;

    const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to your store management dashboard
                </p>
            </div>

            {/* Stats Cards */}
            <AdminStats
                totalUsers={Array.isArray(users) ? users.length : 0}
                totalOrders={Array.isArray(orders) ? orders.length : 0}
                totalProducts={Array.isArray(products) ? products.length : 0}
                totalRevenue={totalRevenue}
            />

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order: any) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">Order #{order.id}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.user_email || "Guest"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                ${parseFloat(order.total_amount || 0).toFixed(2)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent orders</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Pending Orders
                                </span>
                                <span className="font-medium">
                                    {
                                        (orders as any[]).filter((order: any) => order.status === "pending")
                                            .length
                                    }
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Processing Orders
                                </span>
                                <span className="font-medium">
                                    {
                                        (orders as any[]).filter((order: any) => order.status === "processing")
                                            .length
                                    }
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Featured Products
                                </span>
                                <span className="font-medium">
                                    {
                                        (products as any[]).filter((product: any) => product.is_featured)
                                            .length
                                    }
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Low Stock Items
                                </span>
                                <span className="font-medium">
                                    {
                                        (products as any[]).filter(
                                            (product: any) => product.stock_quantity < 10
                                        ).length
                                    }
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
