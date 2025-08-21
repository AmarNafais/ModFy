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
import { Shield, Users, ShoppingBag, Package, FileText, Settings, Plus, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";

export default function Admin() {
  // All hooks must be called in the same order every time
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    material: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'],
    stockQuantity: '50',
    isFeatured: false,
  });

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
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'],
        stockQuantity: '50',
        isFeatured: false,
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

  // Functions that depend on state
  const handleImageUpload = async (result: any) => {
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        const response = await apiRequest("POST", "/api/admin/process-image", { uploadURL });
        const data = await response.json();
        const { imageUrl } = data;
        
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
        
        toast({
          title: "Image Uploaded",
          description: "Product image uploaded successfully.",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process uploaded image.",
        variant: "destructive",
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
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
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
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
                      <TableCell data-testid={`text-amount-${order.id}`}>${order.totalAmount}</TableCell>
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
                        <Label htmlFor="product-price">Price ($)</Label>
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
                          value={productForm.stockQuantity}
                          onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                          placeholder="50"
                          data-testid="input-product-stock"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="product-featured"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          data-testid="checkbox-product-featured"
                        />
                        <Label htmlFor="product-featured">Featured Product</Label>
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
                        
                        {/* Upload New Image Button */}
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880} // 5MB
                          onGetUploadParameters={async () => {
                            try {
                              const response = await apiRequest("POST", "/api/objects/upload", {});
                              const data = await response.json();
                              console.log("Upload parameters response:", data);
                              return {
                                method: "PUT" as const,
                                url: data.uploadURL,
                              };
                            } catch (error) {
                              console.error("Failed to get upload parameters:", error);
                              throw error;
                            }
                          }}
                          onComplete={handleImageUpload}
                          buttonClassName="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Product Image
                        </ObjectUploader>
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
                        ${product.price}
                      </TableCell>
                      <TableCell data-testid={`text-product-stock-${product.id}`}>
                        {product.stockQuantity}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isFeatured ? "default" : "secondary"} data-testid={`badge-featured-${product.id}`}>
                          {product.isFeatured ? 'Featured' : 'Regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"} data-testid={`badge-active-${product.id}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
                        <Badge variant={category.isActive ? "default" : "secondary"} data-testid={`badge-category-active-${category.id}`}>
                          {category.isActive ? 'Active' : 'Inactive'}
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