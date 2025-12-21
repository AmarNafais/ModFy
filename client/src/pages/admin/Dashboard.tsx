import { useQuery } from "@tanstack/react-query";
import { AdminStats } from "@/components/admin/AdminStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, TrendingUp, Users, Search, LayoutDashboard, BarChart3, Ruler } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    subItems?: NavItem[];
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: <Package className="h-4 w-4" />,
        subItems: [
            {
                label: "Product List",
                href: "/admin/products",
                icon: null,
            },
            {
                label: "Categories",
                href: "/admin/categories",
                icon: null,
            },
            {
                label: "Size Charts",
                href: "/admin/size-charts",
                icon: null,
            },
        ],
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: <Users className="h-4 w-4" />,
    },
    {
        label: "Analytics",
        href: "/admin/analytics",
        icon: <BarChart3 className="h-4 w-4" />,
    },
];

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState<string>("");
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

    const filteredNavItems = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        const results: { label: string; href: string; icon: React.ReactNode; isSubItem?: boolean }[] = [];

        navItems.forEach((item) => {
            // Check main item
            if (item.label.toLowerCase().includes(query)) {
                results.push({
                    label: item.label,
                    href: item.href,
                    icon: item.icon,
                });
            }

            // Check sub items
            if (item.subItems) {
                item.subItems.forEach((subItem) => {
                    if (subItem.label.toLowerCase().includes(query)) {
                        results.push({
                            label: `${item.label} > ${subItem.label}`,
                            href: subItem.href,
                            icon: item.icon,
                            isSubItem: true,
                        });
                    }
                });
            }
        });

        return results;
    }, [searchQuery]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your store management dashboard
                    </p>
                </div>
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[250px]"
                        />
                    </div>
                    {searchQuery.trim() && filteredNavItems.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {filteredNavItems.map((item, index) => (
                                <Link key={index} href={item.href}>
                                    <a className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0">
                                        {item.icon}
                                        <span className={item.isSubItem ? "text-xs" : ""}>{item.label}</span>
                                    </a>
                                </Link>
                            ))}
                        </div>
                    )}
                    {searchQuery.trim() && filteredNavItems.length === 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 text-sm text-gray-500">
                            No results found
                        </div>
                    )}
                </div>
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
