import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    name: string;
  };
}

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (product: Product) => void;
  getProductStatus: (product: Product) => string;
  getProductStatusBadgeVariant: (status: string) => any;
  isDeleting: boolean;
  isTogglingStatus: boolean;
  addProductTrigger: React.ReactNode;
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  getProductStatus,
  getProductStatusBadgeVariant,
  isDeleting,
  isTogglingStatus,
  addProductTrigger,
}: ProductsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Products Management
        </CardTitle>
        {addProductTrigger}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(products) && products.map((product: any) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell className="font-medium" data-testid={`text-product-name-${product.id}`}>
                  {product.name}
                </TableCell>
                <TableCell data-testid={`text-product-category-${product.id}`}>
                  {product.category?.name || 'N/A'}
                </TableCell>
                <TableCell data-testid={`text-product-price-${product.id}`}>
                  LKR {product.price}
                </TableCell>
                <TableCell data-testid={`text-product-stock-${product.id}`}>
                  {product.stock_quantity}
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_featured ? "default" : "secondary"} data-testid={`badge-featured-${product.id}`}>
                    {product.is_featured ? 'Featured' : 'Regular'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => onToggleStatus(product)}
                    disabled={isTogglingStatus}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    data-testid={`button-toggle-status-${product.id}`}
                  >
                    <Badge variant={getProductStatusBadgeVariant(getProductStatus(product))} data-testid={`badge-status-${product.id}`}>
                      {getProductStatus(product)}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product)}
                      data-testid={`button-edit-product-${product.id}`}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      disabled={isDeleting}
                      data-testid={`button-delete-product-${product.id}`}
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
