import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Package, Edit, Trash2, Search, RotateCcw, FileSpreadsheet } from "lucide-react";
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
  onFilteredCountChange?: (count: number) => void;
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
  onFilteredCountChange,
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

  // Notify parent component of filtered count changes
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredProducts.length);
    }
  }, [filteredProducts, onFilteredCountChange]);

  const exportToExcel = () => {
    const headers = ['Name', 'Category', 'Subcategory', 'Price', 'Stock', 'Featured', 'Status'];
    const rows = filteredProducts.map((product: any) => [
      product.name,
      product.category?.name || 'N/A',
      product.subcategory?.name || 'N/A',
      `LKR ${product.price}`,
      product.stock_quantity,
      product.is_featured ? 'Featured' : 'Regular',
      getProductStatus(product)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]}_${now.toTimeString().split(' ')[0].replace(/:/g, '-')}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardContent className="overflow-x-auto">
        {/* Category Filter */}
        <div className="mb-6 mt-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[250px] pl-9"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.isArray(mainCategories) && mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Subcategory Filter */}
              <Select 
                value={selectedSubCategory} 
                onValueChange={setSelectedSubCategory}
                disabled={selectedCategory === "all"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={selectedCategory === "all" ? "Select category first" : "All Subcategories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {Array.isArray(subCategories) && subCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {addProductTrigger}
              <Button
                variant="default"
                size="sm"
                onClick={exportToExcel}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead className="w-[150px]">Category</TableHead>
              <TableHead className="w-[120px]">Price</TableHead>
              <TableHead className="w-[100px]">Stock</TableHead>
              <TableHead className="w-[120px]">Featured</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(filteredProducts) && filteredProducts.map((product: any) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell className="font-medium min-w-[200px]" data-testid={`text-product-name-${product.id}`}>
                  {product.name}
                </TableCell>
                <TableCell className="w-[150px]" data-testid={`text-product-category-${product.id}`}>
                  {product.category?.name || 'N/A'}
                </TableCell>
                <TableCell className="w-[120px]" data-testid={`text-product-price-${product.id}`}>
                  LKR {product.price}
                </TableCell>
                <TableCell className="w-[100px]" data-testid={`text-product-stock-${product.id}`}>
                  {product.stock_quantity}
                </TableCell>
                <TableCell className="w-[120px]">
                  <Badge variant={product.is_featured ? "default" : "secondary"} data-testid={`badge-featured-${product.id}`}>
                    {product.is_featured ? 'Featured' : 'Regular'}
                  </Badge>
                </TableCell>
                <TableCell className="w-[120px]">
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
                <TableCell className="w-[120px]">
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
        </div>
      </CardContent>
    </Card>
  );
}
