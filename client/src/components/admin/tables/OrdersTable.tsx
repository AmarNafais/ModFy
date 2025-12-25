import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, RotateCcw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface Order {
  id: string;
  orderNumber: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  getPaymentBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  onFilteredCountChange?: (count: number) => void;
}

export function OrdersTable({ orders, onStatusChange, onDeleteOrder, getStatusBadgeVariant, getPaymentBadgeVariant, onFilteredCountChange }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        (order.user?.firstName && order.user.firstName.toLowerCase().includes(query)) ||
        (order.user?.lastName && order.user.lastName.toLowerCase().includes(query)) ||
        order.status.toLowerCase().includes(query) ||
        order.paymentStatus.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by payment status
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  // Notify parent of filtered count
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredOrders.length);
    }
  }, [filteredOrders, onFilteredCountChange]);

  return (
    <Card>
      <CardContent>
        <div className="mb-6 mt-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[250px] pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(filteredOrders) && filteredOrders.map((order: any) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-medium" data-testid={`text-order-number-${order.id}`}>
                  {order.orderNumber}
                </TableCell>
                <TableCell data-testid={`text-customer-${order.id}`}>
                  {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)} data-testid={`badge-status-${order.id}`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} data-testid={`badge-payment-${order.id}`}>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-amount-${order.id}`}>LKR {order.totalAmount}</TableCell>
                <TableCell data-testid={`text-date-${order.id}`}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => onStatusChange(order.id, value)}
                      data-testid={`select-status-${order.id}`}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteOrder?.(order.id)}
                      data-testid={`button-delete-order-${order.id}`}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
