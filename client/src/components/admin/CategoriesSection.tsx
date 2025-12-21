import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Edit, Trash2, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  parent_id?: string;
}

interface CategoriesSectionProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  isDeleting: boolean;
  addCategoryTrigger: React.ReactNode;
  addSubcategoryTrigger: React.ReactNode;
}

export function CategoriesSection({
  categories,
  onEdit,
  onDelete,
  isDeleting,
  addCategoryTrigger,
  addSubcategoryTrigger,
}: CategoriesSectionProps) {
  const [mainSearchQuery, setMainSearchQuery] = useState<string>("");
  const [mainStatusFilter, setMainStatusFilter] = useState<string>("all");
  const [subSearchQuery, setSubSearchQuery] = useState<string>("");
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");

  const filteredMainCategories = useMemo(() => {
    let filtered = Array.isArray(categories) ? categories.filter((cat: any) => !cat.parent_id) : [];

    // Filter by search query
    if (mainSearchQuery.trim()) {
      const query = mainSearchQuery.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(query) ||
        (category.description && category.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (mainStatusFilter !== "all") {
      const isActive = mainStatusFilter === "active";
      filtered = filtered.filter((category) => {
        const categoryActive = Boolean(category.is_active);
        return categoryActive === isActive;
      });
    }

    return filtered;
  }, [categories, mainSearchQuery, mainStatusFilter]);

  const filteredSubcategories = useMemo(() => {
    let filtered = Array.isArray(categories) ? categories.filter((cat: any) => cat.parent_id) : [];

    // Filter by search query
    if (subSearchQuery.trim()) {
      const query = subSearchQuery.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(query) ||
        (category.description && category.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (subStatusFilter !== "all") {
      const isActive = subStatusFilter === "active";
      filtered = filtered.filter((category) => {
        const categoryActive = Boolean(category.is_active);
        return categoryActive === isActive;
      });
    }

    return filtered;
  }, [categories, subSearchQuery, subStatusFilter]);

  const mainCategories = filteredMainCategories;
  const subcategories = filteredSubcategories;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Types (Categories)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Main Categories Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Main Categories</h3>
            {addCategoryTrigger}
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search main categories..."
                  value={mainSearchQuery}
                  onChange={(e) => setMainSearchQuery(e.target.value)}
                  className="w-[250px]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="main-status-filter" className="text-sm font-medium text-gray-700">
                    Status:
                  </label>
                  <Select value={mainStatusFilter} onValueChange={setMainStatusFilter}>
                    <SelectTrigger id="main-status-filter" className="w-[120px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMainCategories.map((category: any) => (
                <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                  <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>
                    {category.name}
                  </TableCell>
                  <TableCell data-testid={`text-category-description-${category.id}`}>
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"} data-testid={`badge-category-active-${category.id}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(category)}
                        data-testid={`button-edit-category-${category.id}`}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(category.id)}
                        disabled={isDeleting}
                        data-testid={`button-delete-category-${category.id}`}
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

        {/* Subcategories Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Subcategories</h3>
            {addSubcategoryTrigger}
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search subcategories..."
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  className="w-[250px]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="sub-status-filter" className="text-sm font-medium text-gray-700">
                    Status:
                  </label>
                  <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
                    <SelectTrigger id="sub-status-filter" className="w-[120px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead>Parent Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubcategories.map((category: any) => {
                const parentCategory = categories.find((c: any) => c.id === category.parent_id);
                return (
                  <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                    <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>
                      {category.name}
                    </TableCell>
                    <TableCell data-testid={`text-category-parent-${category.id}`}>
                      {parentCategory ? parentCategory.name : '-'}
                    </TableCell>
                    <TableCell data-testid={`text-category-description-${category.id}`}>
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"} data-testid={`badge-category-active-${category.id}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(category)}
                          data-testid={`button-edit-category-${category.id}`}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(category.id)}
                          disabled={isDeleting}
                          data-testid={`button-delete-category-${category.id}`}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
