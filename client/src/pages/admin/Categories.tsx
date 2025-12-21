import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CategoriesSection } from "@/components/admin/CategoriesSection";
import { AddCategoryDialog, AddSubcategoryDialog, EditCategoryDialog } from "@/components/admin/dialogs";

export default function AdminCategories() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        parentId: '',
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["/api/admin/product-types"],
    });

    const createCategoryMutation = useMutation({
        mutationFn: (categoryData: any) =>
            apiRequest("POST", "/api/admin/categories", categoryData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/product-types"] });
            setIsCategoryDialogOpen(false);
            setIsSubcategoryDialogOpen(false);
            setCategoryForm({
                name: '',
                description: '',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                parentId: '',
            });
            toast({
                title: "Category Created",
                description: "Category created successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create category.",
                variant: "destructive",
            });
        },
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, categoryData }: { id: string; categoryData: any }) =>
            apiRequest("PATCH", `/api/admin/categories/${id}`, categoryData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/product-types"] });
            setIsEditCategoryDialogOpen(false);
            setEditingCategory(null);
            toast({
                title: "Category Updated",
                description: "Category updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update category.",
                variant: "destructive",
            });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (categoryId: string) =>
            apiRequest("DELETE", `/api/admin/categories/${categoryId}`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/product-types"] });
            toast({
                title: "Category Deleted",
                description: "Category and related items deleted successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete category.",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                <p className="text-muted-foreground">
                    Manage product categories and subcategories
                </p>
            </div>

            <CategoriesSection
                categories={categories as any[]}
                onEdit={(category) => {
                    setEditingCategory(category);
                    setIsEditCategoryDialogOpen(true);
                }}
                onDelete={(categoryId) => deleteCategoryMutation.mutate(categoryId)}
                isDeleting={deleteCategoryMutation.isPending}
                addCategoryTrigger={
                    <AddCategoryDialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                        categoryForm={categoryForm}
                        setCategoryForm={setCategoryForm}
                        onSubmit={() => createCategoryMutation.mutate(categoryForm)}
                        isPending={createCategoryMutation.isPending}
                    />
                }
                addSubcategoryTrigger={
                    <AddSubcategoryDialog
                        open={isSubcategoryDialogOpen}
                        onOpenChange={setIsSubcategoryDialogOpen}
                        categoryForm={categoryForm}
                        setCategoryForm={setCategoryForm}
                        categories={categories as any[]}
                        onSubmit={() => createCategoryMutation.mutate(categoryForm)}
                        isPending={createCategoryMutation.isPending}
                    />
                }
            />

            <EditCategoryDialog
                open={isEditCategoryDialogOpen}
                onOpenChange={setIsEditCategoryDialogOpen}
                editingCategory={editingCategory}
                setEditingCategory={setEditingCategory}
                categories={categories as any[]}
                onSubmit={() => updateCategoryMutation.mutate({ id: editingCategory.id, categoryData: editingCategory })}
                isPending={updateCategoryMutation.isPending}
            />
        </div>
    );
}
