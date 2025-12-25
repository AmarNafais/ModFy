import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ProductsTable } from "@/components/admin/tables";
import { AddProductDialog, EditProductDialog } from "@/components/admin/dialogs";
import { getProductStatus, getNextStatus, getProductStatusBadgeVariant } from "@/lib/adminHelpers";

export default function AdminProducts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [filteredCount, setFilteredCount] = useState(0);

    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        subcategoryId: '',
        material: '',
        sizes: ['S', 'M', 'L', 'XL'],
        sizePricing: { 'S': '45.00', 'M': '48.00', 'L': '52.00', 'XL': '56.00' } as Record<string, string>,
        hideSizes: false,
        sizeChartId: '',
        images: [] as string[],
        stock_quantity: '50',
        is_featured: false,
        piecesPerPack: '1',
    });

    const { data: products = [] } = useQuery({
        queryKey: ["/api/products"],
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["/api/admin/product-types"],
    });

    const { data: sizeCharts = [] } = useQuery({
        queryKey: ["/api/admin/size-charts"],
    });

    const createProductMutation = useMutation({
        mutationFn: (productData: any) =>
            apiRequest("POST", "/api/admin/products", productData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            setIsProductDialogOpen(false);
            setProductForm({
                name: '',
                description: '',
                price: '',
                categoryId: '',
                subcategoryId: '',
                material: '',
                sizes: ['S', 'M', 'L', 'XL'],
                sizePricing: { 'S': '45.00', 'M': '48.00', 'L': '52.00', 'XL': '56.00' } as Record<string, string>,
                hideSizes: false,
                sizeChartId: '',
                images: [] as string[],
                stock_quantity: '50',
                is_featured: false,
                piecesPerPack: '1',
            });
            toast({
                title: "Product Created",
                description: "Product created successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create product.",
                variant: "destructive",
            });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (productId: string) =>
            apiRequest("DELETE", `/api/admin/products/${productId}`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({
                title: "Product Deleted",
                description: "Product deleted successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete product.",
                variant: "destructive",
            });
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, productData }: { id: string; productData: any }) =>
            apiRequest("PATCH", `/api/admin/products/${id}`, productData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            setIsEditDialogOpen(false);
            setEditingProduct(null);
            toast({
                title: "Product Updated",
                description: "Product updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update product.",
                variant: "destructive",
            });
        },
    });

    const toggleProductStatusMutation = useMutation({
        mutationFn: ({ productId, is_active, stock_quantity }: { productId: string; is_active: boolean; stock_quantity: number }) =>
            apiRequest("PATCH", `/api/admin/products/${productId}`, { is_active, stock_quantity }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({
                title: "Status Updated",
                description: "Product status updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update product status.",
                variant: "destructive",
            });
        },
    });

    const removeImage = (indexToRemove: number) => {
        setProductForm((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, index: number) => index !== indexToRemove)
        }));
    };

    const removeEditImage = (indexToRemove: number) => {
        setEditingProduct((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, index: number) => index !== indexToRemove)
        }));
    };

    const openEditDialog = (product: any) => {
        setEditingProduct({
            ...product,
            price: product.price.toString(),
            stock_quantity: product.stock_quantity,
            sizes: product.sizes || [],
            sizePricing: product.sizePricing || {},
            hideSizes: product.hideSizes || false,
            piecesPerPack: product.piecesPerPack || '1',
        });
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <span className="text-2xl font-semibold text-black">
                        ({filteredCount || products.length}{filteredCount < products.length ? ` / ${products.length}` : ''})
                    </span>
                </div>
            </div>
            <p className="text-muted-foreground">
                Manage your product catalog
            </p>

            <ProductsTable
                products={products as any[]}
                categories={categories as any[]}
                sub_categories={categories as any[]}
                onEdit={openEditDialog}
                onDelete={(productId) => deleteProductMutation.mutate(productId)}
                onToggleStatus={(product) => {
                    const nextStatus = getNextStatus(product);
                    toggleProductStatusMutation.mutate({
                        productId: product.id,
                        is_active: nextStatus.is_active,
                        stock_quantity: nextStatus.stock_quantity
                    });
                }}
                getProductStatus={getProductStatus}
                getProductStatusBadgeVariant={getProductStatusBadgeVariant}
                isDeleting={deleteProductMutation.isPending}
                isTogglingStatus={toggleProductStatusMutation.isPending}
                onFilteredCountChange={setFilteredCount}
                addProductTrigger={
                    <AddProductDialog
                        open={isProductDialogOpen}
                        onOpenChange={setIsProductDialogOpen}
                        productForm={productForm}
                        setProductForm={setProductForm as any}
                        categories={categories as any[]}
                        sizeCharts={sizeCharts as any[]}
                        removeImage={removeImage}
                        onSubmit={() => createProductMutation.mutate(productForm)}
                        isPending={createProductMutation.isPending}
                    />
                }
            />

            <EditProductDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                categories={categories as any[]}
                sizeCharts={sizeCharts as any[]}
                removeEditImage={removeEditImage}
                onSubmit={() => updateProductMutation.mutate({ id: editingProduct.id, productData: editingProduct })}
                isPending={updateProductMutation.isPending}
            />
        </div>
    );
}
