import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

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
  onFilteredCountChange?: (count: number) => void;
}

export function CategoriesSection({
  categories,
  onEdit,
  onDelete,
  isDeleting,
  addCategoryTrigger,
  addSubcategoryTrigger,
  onFilteredCountChange,
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
  const [draggableMain, setDraggableMain] = useState(filteredMainCategories);

  // keep draggableMain in sync when filters or categories change
  useEffect(() => setDraggableMain(filteredMainCategories), [filteredMainCategories]);

  // Notify parent of filtered count
  useEffect(() => {
    if (onFilteredCountChange) {
      const totalFiltered = filteredMainCategories.length + filteredSubcategories.length;
      onFilteredCountChange(totalFiltered);
    }
  }, [filteredMainCategories, filteredSubcategories, onFilteredCountChange]);

  const onDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  const onDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent<HTMLTableRowElement>, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(fromIndex)) return;
    const items = Array.from(draggableMain);
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    setDraggableMain(items);

    // call reorder API
    try {
      const res = await fetch('/api/admin/categories/reorder', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: items.map(c => c.id) }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      // reload to refresh server-ordered lists
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to reorder categories');
    }
  };
  const subcategories = filteredSubcategories;

  return (
    <Card>
      <CardContent className="space-y-8 pt-6">
        {/* Main Categories Table */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Main Categories</h3>
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search main categories..."
                    value={mainSearchQuery}
                    onChange={(e) => setMainSearchQuery(e.target.value)}
                    className="w-[250px] pl-9"
                  />
                </div>
                <Select value={mainStatusFilter} onValueChange={setMainStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                {addCategoryTrigger}
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
              {draggableMain.map((category: any, idx: number) => (
                <TableRow key={category.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, idx)} data-testid={`row-category-${category.id}`}>
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

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Subcategories Table */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Subcategories</h3>
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search subcategories..."
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    className="w-[250px] pl-9"
                  />
                </div>
                <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                {addSubcategoryTrigger}
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
