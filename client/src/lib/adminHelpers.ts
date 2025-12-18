// Helper functions for admin dashboard

/**
 * Determines the current status of a product
 */
export const getProductStatus = (product: any): string => {
  if (!product.is_active) return 'Inactive';
  if (product.stock_quantity === 0) return 'Out of Stock';
  return 'Active';
};

/**
 * Gets the next status in the cycle: Active → Out of Stock → Inactive → Active
 */
export const getNextStatus = (product: any) => {
  const currentStatus = getProductStatus(product);
  switch (currentStatus) {
    case 'Active':
      return { is_active: true, stock_quantity: 0 }; // Out of Stock
    case 'Out of Stock':
      return { is_active: false, stock_quantity: 0 }; // Inactive
    case 'Inactive':
      return { is_active: true, stock_quantity: Math.max(1, product.stock_quantity) }; // Active
    default:
      return { is_active: true, stock_quantity: Math.max(1, product.stock_quantity) };
  }
};

/**
 * Gets badge variant for product status
 */
export const getProductStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Active':
      return 'default';
    case 'Out of Stock':
      return 'destructive';
    case 'Inactive':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Gets badge variant for order status
 */
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "delivered": return "default";
    case "shipped": return "secondary";
    case "pending": return "destructive";
    case "confirmed": return "outline";
    case "cancelled": return "destructive";
    default: return "secondary";
  }
};

/**
 * Gets badge variant for payment status
 */
export const getPaymentBadgeVariant = (status: string) => {
  switch (status) {
    case "paid": return "default";
    case "pending": return "destructive";
    case "failed": return "destructive";
    default: return "secondary";
  }
};
