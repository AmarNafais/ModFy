import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Package, Edit, Trash2, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  parent_id?: string | null; // Database returns snake_case
}

interface ProductsTableProps {
  products: Product[];
  categories?: Category[];
  sub_categories?: Category[];
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
  categories = [],
  sub_categories = [],
  onEdit,
  onDelete,
  onToggleStatus,
  getProductStatus,
  getProductStatusBadgeVariant,
  isDeleting,
  isTogglingStatus,
  addProductTrigger,
}: ProductsTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reset subcategory filter when main category changes
  useEffect(() => {
    setSelectedSubCategory("all");
  }, [selectedCategory]);

  // Filter to show only main categories (those without a parent)
  const mainCategories = useMemo(() => {
    return categories.filter((category) => !category.parentId && !category.parent_id);
  }, [categories]);

  // Filter subcategories based on selected main category
  const subCategories = useMemo(() => {
    if (selectedCategory === "all") {
      return [];
    }
    return sub_categories.filter((category) => category.parentId === selectedCategory || category.parent_id === selectedCategory);
  }, [sub_categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by main category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category?.id === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubCategory !== "all") {
      filtered = filtered.filter((product) => product.subcategory?.id === selectedSubCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [products, selectedCategory, selectedSubCategory, searchQuery]);

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
        {/* Category Filter */}
        <div className="mb-6">
          {/* <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter Products</h3> */}
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
              />
              {/* <Search className="h-4 w-4 text-gray-500" /> */}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
                  Category:
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter" className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Filter</SelectItem>
                    {Array.isArray(mainCategories) && mainCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="subcategory-filter" className="text-sm font-medium text-gray-700">
                  Sub Category:
                </label>
                <Select 
                  value={selectedSubCategory} 
                  onValueChange={setSelectedSubCategory}
                  disabled={selectedCategory === "all"}
                >
                  <SelectTrigger id="subcategory-filter" className="w-[200px]">
                    <SelectValue placeholder={selectedCategory === "all" ? "Select a category first" : "All Sub Categories"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Filter</SelectItem>
                    {Array.isArray(subCategories) && subCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
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
            {Array.isArray(filteredProducts) && filteredProducts.map((product: any) => (
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
