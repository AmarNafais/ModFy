import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { OrdersTable } from "@/components/admin/tables";
import { getStatusBadgeVariant, getPaymentBadgeVariant } from "@/lib/adminHelpers";

export default function AdminOrders() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filteredCount, setFilteredCount] = useState(0);

    const { data: orders = [] } = useQuery({
        queryKey: ["/api/admin/orders"],
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
            apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            toast({
                title: "Order Updated",
                description: "Order status updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update order status.",
                variant: "destructive",
            });
        },
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (orderId: string) =>
            apiRequest("DELETE", `/api/admin/orders/${orderId}`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            toast({
                title: "Order Deleted",
                description: "Order deleted successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete order.",
                variant: "destructive",
            });
        },
    });

    const handleStatusChange = (orderId: string, status: string) => {
        updateOrderStatusMutation.mutate({ orderId, status });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                        <span className="text-2xl font-semibold text-black">
                            ({filteredCount || orders.length}{filteredCount < orders.length ? ` / ${orders.length}` : ''})
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        View and manage customer orders
                    </p>
                </div>
            </div>

            <OrdersTable
                orders={orders as any[]}
                onStatusChange={handleStatusChange}
                onDeleteOrder={(orderId) => {
                    if (confirm('Are you sure you want to delete this order?')) {
                        deleteOrderMutation.mutate(orderId);
                    }
                }}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getPaymentBadgeVariant={getPaymentBadgeVariant}
            />
        </div>
    );
}
