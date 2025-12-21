import { Route, Switch, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Orders from "./Orders";
import Users from "./Users";
import Categories from "./Categories";
import SizeCharts from "./SizeCharts";
import Analytics from "./Analytics";
import ContactUs from "./ContactUs";

export default function AdminRoot() {
    const { user, isLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoading && (!user || (user as any).role !== 'admin')) {
            toast({
                title: "Access Denied",
                description: "Admin access required to view this page.",
                variant: "destructive",
            });
        }
    }, [user, isLoading, toast]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user || (user as any).role !== 'admin') {
        return <Redirect to="/" />;
    }

    return (
        <AdminLayout>
            <Switch>
                <Route path="/admin" component={Dashboard} />
                <Route path="/admin/products" component={Products} />
                <Route path="/admin/orders" component={Orders} />
                <Route path="/admin/users" component={Users} />
                <Route path="/admin/categories" component={Categories} />
                <Route path="/admin/size-charts" component={SizeCharts} />
                <Route path="/admin/analytics" component={Analytics} />
                <Route path="/admin/contact" component={ContactUs} />
                <Route>
                    <Redirect to="/admin" />
                </Route>
            </Switch>
        </AdminLayout>
    );
}
