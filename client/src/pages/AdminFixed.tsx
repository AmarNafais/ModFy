import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, ShoppingBag, Package, FileText, Settings } from "lucide-react";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";
import { AdminStats } from "@/components/admin/AdminStats";
import { OrdersTable, UsersTable, ProductsTable, CollectionsTable } from "@/components/admin/tables";
import { AddProductDialog, AddCategoryDialog, AddSubcategoryDialog, EditProductDialog, AddUserDialog, EditUserDialog } from "@/components/admin/dialogs";
import { CategoriesSection } from "@/components/admin/CategoriesSection";
import { getProductStatus, getNextStatus, getProductStatusBadgeVariant, getStatusBadgeVariant, getPaymentBadgeVariant } from "@/lib/adminHelpers";

export default function Admin() {
  // All hooks must be called in the same order every time
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',
    material: '',
    sizes: ['S', 'M', 'L', 'XL'],
    sizePricing: { 'S': '45.00', 'M': '48.00', 'L': '52.00', 'XL': '56.00' } as Record<string, string>,
    images: [],
    stock_quantity: '50',
    is_featured: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    parentId: '',
  });

  const isAdmin = Boolean(!isLoading && user && (user as any).role === 'admin');

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: isAdmin,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAdmin,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["/api/collections"],
    enabled: isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/admin/product-types"],
    enabled: isAdmin,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order Updated",
        description: "Order status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiRequest("DELETE", `/api/admin/orders/${orderId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order Deleted",
        description: "Order deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete order.",
        variant: "destructive",
      });
    },
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
        images: [],
        stock_quantity: '50',
        is_featured: false,
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

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: any) =>
      apiRequest("POST", "/api/admin/categories", categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-types"] });
      setIsCategoryDialogOpen(false);
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

  const createUserMutation = useMutation({
    mutationFn: (userData: any) =>
      apiRequest("POST", "/api/admin/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserDialogOpen(false);
      toast({
        title: "User Created",
        description: "User created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest("DELETE", `/api/admin/users/${userId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      apiRequest("PATCH", `/api/admin/users/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
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

  // All useEffect calls after state hooks
  useEffect(() => {
    if (!isLoading && (!user || (user as any).role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "Admin access required to view this page.",
        variant: "destructive",
      });
    }
  }, [user, isLoading, toast]);

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

  // Functions that depend on state
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
    });
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (user as any).role !== 'admin') {
    return <Redirect to="/" />;
  }

  // Calculate stats
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalRevenue = Array.isArray(orders) ? orders
    .filter((order: any) => order.paymentStatus === 'paid')
    .reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0) : 0;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-black" />
          <div>
            <h1 className="text-3xl font-light">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your MODFY store</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Admin Access
        </Badge>
      </div>

      {/* Stats Cards */}
      <AdminStats
        totalUsers={totalUsers}
        totalOrders={totalOrders}
        totalProducts={totalProducts}
        totalRevenue={totalRevenue}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
            <ShoppingBag className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2" data-testid="tab-collections">
            <FileText className="w-4 h-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="product-types" className="flex items-center gap-2" data-testid="tab-product-types">
            <Settings className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-users">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrdersTable
            orders={orders}
            onStatusChange={handleStatusChange}
            onDeleteOrder={(orderId) => {
              if (confirm('Are you sure you want to delete this order?')) {
                deleteOrderMutation.mutate(orderId);
              }
            }}
            getStatusBadgeVariant={getStatusBadgeVariant}
            getPaymentBadgeVariant={getPaymentBadgeVariant}
          />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <ProductsTable
            products={products}
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
            addProductTrigger={
              <AddProductDialog
                open={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
                productForm={productForm}
                setProductForm={setProductForm}
                categories={categories}
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
            categories={categories}
            removeEditImage={removeEditImage}
            onSubmit={() => updateProductMutation.mutate({ id: editingProduct.id, productData: editingProduct })}
            isPending={updateProductMutation.isPending}
          />
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections">
          <CollectionsTable collections={collections} />
        </TabsContent>

        {/* Product Types Tab */}
        <TabsContent value="product-types">
          <CategoriesSection
            categories={categories}
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
                categories={categories}
                onSubmit={() => createCategoryMutation.mutate(categoryForm)}
                isPending={createCategoryMutation.isPending}
              />
            }
          />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex justify-end">
              <AddUserDialog
                open={isUserDialogOpen}
                onOpenChange={setIsUserDialogOpen}
                onSubmit={(userData) => createUserMutation.mutate(userData)}
                isLoading={createUserMutation.isPending}
              />
            </div>
            <UsersTable
              users={users}
              onEditUser={(user) => {
                setEditingUser(user);
                setIsEditUserDialogOpen(true);
              }}
              onDeleteUser={(userId) => {
                if (confirm('Are you sure you want to delete this user?')) {
                  deleteUserMutation.mutate(userId);
                }
              }}
            />
            <EditUserDialog
              open={isEditUserDialogOpen}
              onOpenChange={setIsEditUserDialogOpen}
              user={editingUser}
              onSubmit={(userId, data) => updateUserMutation.mutate({ userId, data })}
              isLoading={updateUserMutation.isPending}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}