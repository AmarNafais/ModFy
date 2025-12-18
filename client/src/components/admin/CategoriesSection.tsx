import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2 } from "lucide-react";

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
  const mainCategories = Array.isArray(categories) ? categories.filter((cat: any) => !cat.parent_id) : [];
  const subcategories = Array.isArray(categories) ? categories.filter((cat: any) => cat.parent_id) : [];

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
              {mainCategories.map((category: any) => (
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
              {subcategories.map((category: any) => {
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
