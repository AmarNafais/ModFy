import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

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
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  getPaymentBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
}

export function OrdersTable({ orders, onStatusChange, getStatusBadgeVariant, getPaymentBadgeVariant }: OrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Orders Management
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {Array.isArray(orders) && orders.map((order: any) => (
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
