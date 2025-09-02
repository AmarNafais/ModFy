import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Users, ShoppingBag, Package, FileText, Settings, Plus, Trash2, Edit } from "lucide-react";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";

export default function Admin() {
  // All hooks must be called in the same order every time
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    material: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    images: [],
    stock_quantity: '50',
    is_featured: false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [editNewImageUrl, setEditNewImageUrl] = useState('');

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
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
        material: '',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White'],
        images: [],
        stock_quantity: '50',
        is_featured: false,
      });
      setNewImageUrl('');
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

  // Helper function to determine product status
  const getProductStatus = (product: any) => {
    if (!product.is_active) return 'Inactive';
    if (product.stock_quantity === 0) return 'Out of Stock';
    return 'Active';
  };

  // Helper function to get next status in cycle: Active → Out of Stock → Inactive → Active
  const getNextStatus = (product: any) => {
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

  // Helper function to get badge variant for product status
  const getProductStatusBadgeVariant = (status: string) => {
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
      setEditNewImageUrl('');
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
  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setProductForm((prev: any) => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setNewImageUrl('');
      toast({
        title: "Image Added",
        description: "Product image URL added successfully.",
      });
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL starting with http:// or https://",
        variant: "destructive",
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setProductForm((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, index: number) => index !== indexToRemove)
    }));
  };

  const addEditImageUrl = () => {
    const url = editNewImageUrl.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setEditingProduct((prev: any) => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setEditNewImageUrl('');
      toast({
        title: "Image Added",
        description: "Product image URL added successfully.",
      });
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL starting with http:// or https://",
        variant: "destructive",
      });
    }
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
      // stock_quantity: product.stock_quantity.toString(),
      stock_quantity: product.stock_quantity,
      sizes: product.sizes || [],
      colors: product.colors || [],
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered": return "default";
      case "shipped": return "secondary";
      case "pending": return "destructive";
      case "confirmed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "destructive";
      case "failed": return "destructive";
      default: return "secondary";
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid orders</p>
          </CardContent>
        </Card>
      </div>

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
            Product Types
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-users">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Orders Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(orders) && orders.map((order: any) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium" data-testid={`text-order-number-${order.id}`}>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell data-testid={`text-customer-${order.id}`}>
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} data-testid={`badge-status-${order.id}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} data-testid={`badge-payment-${order.id}`}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-amount-${order.id}`}>LKR {order.totalAmount}</TableCell>
                      <TableCell data-testid={`text-date-${order.id}`}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          data-testid={`select-status-${order.id}`}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Products Management
              </CardTitle>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" data-testid="button-create-product">
                    <Plus className="w-4 h-4" />
                    Create Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="Enter product name"
                          data-testid="input-product-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-price">Price (LKR)</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="0.00"
                          data-testid="input-product-price"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Enter product description"
                        data-testid="textarea-product-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-category">Category</Label>
                        <Select
                          value={productForm.categoryId}
                          onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                        >
                          <SelectTrigger data-testid="select-product-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(categories) && categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="product-material">Material</Label>
                        <Input
                          id="product-material"
                          value={productForm.material}
                          onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                          placeholder="e.g., Premium Cotton"
                          data-testid="input-product-material"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-stock">Stock Quantity</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          placeholder="50"
                          data-testid="input-product-stock"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="product-featured"
                          checked={productForm.is_featured}
                          onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                          data-testid="checkbox-product-featured"
                        />
                        <Label htmlFor="product-featured">Featured Product</Label>
                      </div>
                    </div>

                    {/* Size and Color Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Available Sizes</Label>
                        <div className="space-y-3">
                          {/* Selected sizes display */}
                          <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-gray-50">
                            {productForm.sizes.length > 0 ? (
                              productForm.sizes.map((size, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded">
                                  {size}
                                  <button
                                    type="button"
                                    onClick={() => setProductForm({
                                      ...productForm,
                                      sizes: productForm.sizes.filter(s => s !== size)
                                    })}
                                    className="ml-1 hover:text-gray-300"
                                    data-testid={`button-remove-size-${size.toLowerCase()}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No sizes selected</span>
                            )}
                          </div>

                          {/* Add common sizes */}
                          <Select onValueChange={(size) => {
                            if (!productForm.sizes.includes(size)) {
                              setProductForm({
                                ...productForm,
                                sizes: [...productForm.sizes, size]
                              });
                            }
                          }}>
                            <SelectTrigger data-testid="select-add-size">
                              <SelectValue placeholder="Add common size" />
                            </SelectTrigger>
                            <SelectContent>
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].filter(size =>
                                !productForm.sizes.includes(size)
                              ).map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Add custom size */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom size"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const value = (e.target as HTMLInputElement).value.trim();
                                  if (value && !productForm.sizes.includes(value)) {
                                    setProductForm({
                                      ...productForm,
                                      sizes: [...productForm.sizes, value]
                                    });
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                              data-testid="input-custom-size"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLButtonElement).previousSibling as HTMLInputElement;
                                const value = input.value.trim();
                                if (value && !productForm.sizes.includes(value)) {
                                  setProductForm({
                                    ...productForm,
                                    sizes: [...productForm.sizes, value]
                                  });
                                  input.value = '';
                                }
                              }}
                              data-testid="button-add-custom-size"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Available Colors</Label>
                        <div className="space-y-3">
                          {/* Selected colors display */}
                          <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-gray-50">
                            {productForm.colors.length > 0 ? (
                              productForm.colors.map((color, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded">
                                  {color}
                                  <button
                                    type="button"
                                    onClick={() => setProductForm({
                                      ...productForm,
                                      colors: productForm.colors.filter(c => c !== color)
                                    })}
                                    className="ml-1 hover:text-gray-300"
                                    data-testid={`button-remove-color-${color.toLowerCase()}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No colors selected</span>
                            )}
                          </div>

                          {/* Add common colors */}
                          <Select onValueChange={(color) => {
                            if (!productForm.colors.includes(color)) {
                              setProductForm({
                                ...productForm,
                                colors: [...productForm.colors, color]
                              });
                            }
                          }}>
                            <SelectTrigger data-testid="select-add-color">
                              <SelectValue placeholder="Add common color" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Black', 'White', 'Gray', 'Navy', 'Charcoal', 'Blue', 'Red', 'Green', 'Brown', 'Beige'].filter(color =>
                                !productForm.colors.includes(color)
                              ).map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Add custom color */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom color"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const value = (e.target as HTMLInputElement).value.trim();
                                  if (value && !productForm.colors.includes(value)) {
                                    setProductForm({
                                      ...productForm,
                                      colors: [...productForm.colors, value]
                                    });
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                              data-testid="input-custom-color"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLButtonElement).previousSibling as HTMLInputElement;
                                const value = input.value.trim();
                                if (value && !productForm.colors.includes(value)) {
                                  setProductForm({
                                    ...productForm,
                                    colors: [...productForm.colors, value]
                                  });
                                  input.value = '';
                                }
                              }}
                              data-testid="button-add-custom-color"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Images Section */}
                    <div>
                      <Label>Product Images</Label>
                      <div className="space-y-4">
                        {/* Current Images */}
                        <div className="grid grid-cols-3 gap-4">
                          {productForm.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-20 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`button-remove-image-${index}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Image URL */}
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            placeholder="Enter image URL (e.g., https://imgur.com/...jpg)"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addImageUrl();
                              }
                            }}
                            data-testid="input-image-url"
                          />
                          <Button
                            type="button"
                            onClick={addImageUrl}
                            disabled={!newImageUrl.trim()}
                            data-testid="button-add-image"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Image
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProductDialogOpen(false)}
                        data-testid="button-cancel-product"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => createProductMutation.mutate(productForm)}
                        disabled={createProductMutation.isPending}
                        data-testid="button-submit-product"
                      >
                        {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                          onClick={() => {
                            const nextStatus = getNextStatus(product);
                            toggleProductStatusMutation.mutate({
                              productId: product.id,
                              is_active: nextStatus.is_active,
                              stock_quantity: nextStatus.stock_quantity
                            });
                          }}
                          disabled={toggleProductStatusMutation.isPending}
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
                            onClick={() => openEditDialog(product)}
                            data-testid={`button-edit-product-${product.id}`}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            disabled={deleteProductMutation.isPending}
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

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              {editingProduct && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-product-name">Product Name</Label>
                      <Input
                        id="edit-product-name"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Enter product name"
                        data-testid="input-edit-product-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-product-price">Price (LKR)</Label>
                      <Input
                        id="edit-product-price"
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        placeholder="0.00"
                        data-testid="input-edit-product-price"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-product-description">Description</Label>
                    <Textarea
                      id="edit-product-description"
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Enter product description"
                      data-testid="textarea-edit-product-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-product-category">Category</Label>
                      <Select
                        value={editingProduct.categoryId}
                        onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryId: value })}
                      >
                        <SelectTrigger data-testid="select-edit-product-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(categories) && categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-product-material">Material</Label>
                      <Input
                        id="edit-product-material"
                        value={editingProduct.material || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                        placeholder="e.g., Premium Cotton"
                        data-testid="input-edit-product-material"
                      />
                    </div>
                  </div>

                  {/* Sizes and Colors Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Available Sizes</Label>
                      <div className="space-y-3">
                        {/* Selected sizes display */}
                        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-gray-50">
                          {editingProduct.sizes && editingProduct.sizes.length > 0 ? (
                            editingProduct.sizes.map((size, index) => (
                              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded">
                                {size}
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({
                                    ...editingProduct,
                                    sizes: editingProduct.sizes.filter(s => s !== size)
                                  })}
                                  className="ml-1 hover:text-gray-300"
                                  data-testid={`button-remove-edit-size-${size.toLowerCase()}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No sizes selected</span>
                          )}
                        </div>

                        {/* Add common sizes */}
                        <Select onValueChange={(size) => {
                          if (!editingProduct.sizes.includes(size)) {
                            setEditingProduct({
                              ...editingProduct,
                              sizes: [...editingProduct.sizes, size]
                            });
                          }
                        }}>
                          <SelectTrigger data-testid="select-edit-add-size">
                            <SelectValue placeholder="Add common size" />
                          </SelectTrigger>
                          <SelectContent>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].filter(size =>
                              !editingProduct.sizes.includes(size)
                            ).map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Add custom size */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add custom size"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (value && !editingProduct.sizes.includes(value)) {
                                  setEditingProduct({
                                    ...editingProduct,
                                    sizes: [...editingProduct.sizes, value]
                                  });
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            data-testid="input-edit-custom-size"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              const input = (e.target as HTMLButtonElement).previousSibling as HTMLInputElement;
                              const value = input.value.trim();
                              if (value && !editingProduct.sizes.includes(value)) {
                                setEditingProduct({
                                  ...editingProduct,
                                  sizes: [...editingProduct.sizes, value]
                                });
                                input.value = '';
                              }
                            }}
                            data-testid="button-edit-add-custom-size"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Available Colors</Label>
                      <div className="space-y-3">
                        {/* Selected colors display */}
                        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-gray-50">
                          {editingProduct.colors && editingProduct.colors.length > 0 ? (
                            editingProduct.colors.map((color, index) => (
                              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded">
                                {color}
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({
                                    ...editingProduct,
                                    colors: editingProduct.colors.filter(c => c !== color)
                                  })}
                                  className="ml-1 hover:text-gray-300"
                                  data-testid={`button-remove-edit-color-${color.toLowerCase()}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No colors selected</span>
                          )}
                        </div>

                        {/* Add common colors */}
                        <Select onValueChange={(color) => {
                          if (!editingProduct.colors.includes(color)) {
                            setEditingProduct({
                              ...editingProduct,
                              colors: [...editingProduct.colors, color]
                            });
                          }
                        }}>
                          <SelectTrigger data-testid="select-edit-add-color">
                            <SelectValue placeholder="Add common color" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Black', 'White', 'Gray', 'Navy', 'Charcoal', 'Blue', 'Red', 'Green', 'Brown', 'Beige'].filter(color =>
                              !editingProduct.colors.includes(color)
                            ).map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Add custom color */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add custom color"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (value && !editingProduct.colors.includes(value)) {
                                  setEditingProduct({
                                    ...editingProduct,
                                    colors: [...editingProduct.colors, value]
                                  });
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            data-testid="input-edit-custom-color"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              const input = (e.target as HTMLButtonElement).previousSibling as HTMLInputElement;
                              const value = input.value.trim();
                              if (value && !editingProduct.colors.includes(value)) {
                                setEditingProduct({
                                  ...editingProduct,
                                  colors: [...editingProduct.colors, value]
                                });
                                input.value = '';
                              }
                            }}
                            data-testid="button-edit-add-custom-color"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-product-stock">Stock Quantity</Label>
                      <Input
                        id="edit-product-stock"
                        type="number"
                        value={editingProduct.stock_quantity}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                        placeholder="50"
                        data-testid="input-edit-product-stock"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="edit-product-featured"
                        checked={editingProduct.is_featured}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                        data-testid="checkbox-edit-product-featured"
                      />
                      <Label htmlFor="edit-product-featured">Featured Product</Label>
                    </div>
                  </div>

                  {/* Product Images Section */}
                  <div>
                    <Label>Product Images</Label>
                    <div className="space-y-4">
                      {/* Current Images */}
                      <div className="grid grid-cols-3 gap-4">
                        {editingProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`button-remove-edit-image-${index}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Image URL */}
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="Enter image URL (e.g., https://imgur.com/...jpg)"
                          value={editNewImageUrl}
                          onChange={(e) => setEditNewImageUrl(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addEditImageUrl();
                            }
                          }}
                          data-testid="input-edit-image-url"
                        />
                        <Button
                          type="button"
                          onClick={addEditImageUrl}
                          disabled={!editNewImageUrl.trim()}
                          data-testid="button-add-edit-image"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Image
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      data-testid="button-cancel-edit-product"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => updateProductMutation.mutate({ id: editingProduct.id, productData: editingProduct })}
                      disabled={updateProductMutation.isPending}
                      data-testid="button-submit-edit-product"
                    >
                      {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Collections Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(collections) && collections.map((collection: any) => (
                    <TableRow key={collection.id} data-testid={`row-collection-${collection.id}`}>
                      <TableCell className="font-medium" data-testid={`text-collection-name-${collection.id}`}>
                        {collection.name}
                      </TableCell>
                      <TableCell data-testid={`text-collection-season-${collection.id}`}>
                        {collection.season}
                      </TableCell>
                      <TableCell data-testid={`text-collection-year-${collection.id}`}>
                        {collection.year}
                      </TableCell>
                      <TableCell data-testid={`text-collection-description-${collection.id}`}>
                        {collection.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Types Tab */}
        <TabsContent value="product-types">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Types (Categories)
              </CardTitle>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" data-testid="button-create-category">
                    <Plus className="w-4 h-4" />
                    Create Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="Enter category name"
                        data-testid="input-category-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Enter category description"
                        data-testid="textarea-category-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-image">Image URL</Label>
                      <Input
                        id="category-image"
                        value={categoryForm.imageUrl}
                        onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-category-image"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCategoryDialogOpen(false)}
                        data-testid="button-cancel-category"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => createCategoryMutation.mutate(categoryForm)}
                        disabled={createCategoryMutation.isPending}
                        data-testid="button-submit-category"
                      >
                        {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(categories) && categories.map((category: any) => (
                    <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                      <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>
                        {category.name}
                      </TableCell>
                      <TableCell data-testid={`text-category-description-${category.id}`}>
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"} data-testid={`badge-category-active-${category.id}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(users) && users.map((user: any) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`text-user-name-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell data-testid={`text-user-email-${user.id}`}>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? "default" : "secondary"} data-testid={`badge-user-role-${user.id}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isEmailVerified ? "default" : "destructive"} data-testid={`badge-email-verified-${user.id}`}>
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-user-created-${user.id}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}