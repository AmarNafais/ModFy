import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  parent_id?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  subcategoryId: string;
  material: string;
  sizes: string[];
  sizePricing: Record<string, string>; // { "S": "45.00", "M": "48.00" }
  images: string[];
  stock_quantity: string;
  is_featured: boolean;
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productForm: ProductFormData;
  setProductForm: (form: ProductFormData) => void;
  categories: Category[];
  removeImage: (index: number) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function AddProductDialog({
  open,
  onOpenChange,
  productForm,
  setProductForm,
  categories,
  removeImage,
  onSubmit,
  isPending
}: AddProductDialogProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        
        // Get main category and subcategory names for organized storage
        let mainCategoryName = 'uncategorized';
        let subCategoryName = '';
        
        if (productForm.subcategoryId) {
          // If subcategory is selected, find it and its parent
          const subcategory = categories.find(c => c.id === productForm.subcategoryId);
          if (subcategory) {
            subCategoryName = subcategory.name;
            const mainCategory = categories.find(c => c.id === subcategory.parent_id);
            if (mainCategory) {
              mainCategoryName = mainCategory.name;
            }
          }
        } else if (productForm.categoryId) {
          // Only main category selected
          const category = categories.find(c => c.id === productForm.categoryId);
          if (category) {
            mainCategoryName = category.name;
          }
        }
        
        const productName = productForm.name || 'unnamed';
        
        // IMPORTANT: Append text fields BEFORE the file so multer can access them in destination callback
        formData.append('categoryName', mainCategoryName);
        formData.append('subcategoryName', subCategoryName);
        formData.append('productName', productName);
        formData.append('image', file);

        const response = await fetch('/api/admin/upload-product-image', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        
        // Add the new image URL to the product form
        setProductForm({
          ...productForm,
          images: [...productForm.images, data.imageUrl]
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" data-testid="button-create-product">
          <Plus className="w-4 h-4" />
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
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
              <Label htmlFor="product-price">Base Price (LKR)</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="0.00"
                data-testid="input-product-price"
              />
              <p className="text-xs text-gray-500 mt-1">Base price for display/sorting. Actual prices set per size below.</p>
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
              <Label htmlFor="product-category">Main Category</Label>
              <Select
                value={productForm.categoryId}
                onValueChange={(value) => setProductForm({ ...productForm, categoryId: value, subcategoryId: '' })}
              >
                <SelectTrigger data-testid="select-product-category">
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories.filter((cat: any) => !cat.parent_id).map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-subcategory">Subcategory</Label>
              <Select
                value={productForm.subcategoryId}
                onValueChange={(value) => setProductForm({ ...productForm, subcategoryId: value })}
                disabled={!productForm.categoryId}
              >
                <SelectTrigger data-testid="select-product-subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories
                    .filter((cat: any) => cat.parent_id === productForm.categoryId)
                    .map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                          onClick={() => {
                            const newSizePricing = { ...productForm.sizePricing };
                            delete newSizePricing[size];
                            setProductForm({
                              ...productForm,
                              sizes: productForm.sizes.filter(s => s !== size),
                              sizePricing: newSizePricing
                            });
                          }}
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
                      sizes: [...productForm.sizes, size],
                      sizePricing: { ...productForm.sizePricing, [size]: productForm.price }
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
                            sizes: [...productForm.sizes, value],
                            sizePricing: { ...productForm.sizePricing, [value]: productForm.price }
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
                          sizes: [...productForm.sizes, value],
                          sizePricing: { ...productForm.sizePricing, [value]: productForm.price }
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
              <Label>Size Pricing (LKR)</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                {productForm.sizes.length > 0 ? (
                  productForm.sizes.map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <Label className="w-12 text-right">{size}:</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.sizePricing[size] || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          sizePricing: { ...productForm.sizePricing, [size]: e.target.value }
                        })}
                        placeholder="0.00"
                        className="flex-1"
                        data-testid={`input-size-price-${size.toLowerCase()}`}
                      />
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Add sizes to set pricing</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Images Section */}
          <div>
            <Label>Product Images</Label>
            <div className="space-y-4">
              {/* Current Images */}
              {productForm.images.length > 0 && (
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
              )}

              {/* Upload Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || !productForm.name || !productForm.categoryId}
                  data-testid="input-file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    uploading || !productForm.name || !productForm.categoryId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    {uploading ? (
                      <span className="font-medium">Uploading...</span>
                    ) : (
                      <>
                        <span className="font-medium text-blue-600 hover:text-blue-700">Click to upload</span>
                        {' or drag and drop'}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF or WebP
                  </p>
                  {(!productForm.name || !productForm.categoryId) && (
                    <p className="text-xs text-red-500 mt-2">
                      Please enter product name and select category first
                    </p>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-product"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isPending}
              data-testid="button-submit-product"
            >
              {isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
