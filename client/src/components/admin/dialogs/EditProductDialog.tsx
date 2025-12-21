import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: any; // Contains sizePricing: Record<string, string>
  setEditingProduct: (product: any) => void;
  categories: Category[];
  sizeCharts: any[];
  removeEditImage: (index: number) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function EditProductDialog({
  open,
  onOpenChange,
  editingProduct,
  setEditingProduct,
  categories,
  sizeCharts,
  removeEditImage,
  onSubmit,
  isPending,
}: EditProductDialogProps) {
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

        if (editingProduct.subcategoryId) {
          // If subcategory is selected, find it and its parent
          const subcategory = categories.find(c => c.id === editingProduct.subcategoryId);
          if (subcategory) {
            subCategoryName = subcategory.name;
            const mainCategory = categories.find(c => c.id === subcategory.parent_id);
            if (mainCategory) {
              mainCategoryName = mainCategory.name;
            }
          }
        } else if (editingProduct.categoryId) {
          // Only main category selected
          const category = categories.find(c => c.id === editingProduct.categoryId);
          if (category) {
            mainCategoryName = category.name;
          }
        }

        const productName = editingProduct.name || 'unnamed';

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

        // Add the new image URL to the product
        setEditingProduct({
          ...editingProduct,
          images: [...(editingProduct.images || []), data.imageUrl]
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

  if (!editingProduct) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
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
              <Label htmlFor="edit-product-category">Main Category</Label>
              <Select
                value={editingProduct.categoryId}
                onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryId: value, subcategoryId: '' })}
              >
                <SelectTrigger data-testid="select-edit-product-category">
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
              <Label htmlFor="edit-product-subcategory">Subcategory</Label>
              <Select
                value={editingProduct.subcategoryId || ''}
                onValueChange={(value) => setEditingProduct({ ...editingProduct, subcategoryId: value })}
                disabled={!editingProduct.categoryId}
              >
                <SelectTrigger data-testid="select-edit-product-subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories
                    .filter((cat: any) => cat.parent_id === editingProduct.categoryId)
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
              <Label htmlFor="edit-product-material">Material</Label>
              <Input
                id="edit-product-material"
                value={editingProduct.material || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                placeholder="e.g., Premium Cotton"
                data-testid="input-edit-product-material"
              />
            </div>
            <div>
              <Label htmlFor="edit-product-stock">Stock Quantity</Label>
              <Input
                id="edit-product-stock"
                type="number"
                value={editingProduct.stock_quantity || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                placeholder="50"
                data-testid="input-edit-product-stock"
              />
            </div>
            <div>
              <Label htmlFor="edit-pieces-per-pack">Pieces per Pack</Label>
              <Input
                id="edit-pieces-per-pack"
                type="number"
                min="1"
                value={editingProduct.piecesPerPack || '1'}
                onChange={(e) => setEditingProduct({ ...editingProduct, piecesPerPack: e.target.value })}
                placeholder="1"
                data-testid="input-edit-pieces-per-pack"
              />
              <p className="text-xs text-gray-500 mt-1">Number of pieces in one pack</p>
            </div>
          </div>

          {/* Size Chart Selection */}
          <div>
            <Label htmlFor="edit-product-size-chart">Size Chart (Optional)</Label>
            <Select
              value={editingProduct.sizeChartId || undefined}
              onValueChange={(value) => setEditingProduct({ ...editingProduct, sizeChartId: value })}
            >
              <SelectTrigger data-testid="select-edit-size-chart">
                <SelectValue placeholder="Select size chart (optional)" />
              </SelectTrigger>
              <SelectContent>
                {sizeCharts.filter((chart: any) => chart.is_active).map((chart: any) => (
                  <SelectItem key={chart.id} value={chart.id}>
                    {chart.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hide Sizes Toggle */}
          <div className="flex items-center space-x-2 p-4 border rounded-md bg-gray-50">
            <input
              type="checkbox"
              id="edit-product-hide-sizes"
              checked={editingProduct.hideSizes || false}
              onChange={(e) => setEditingProduct({ ...editingProduct, hideSizes: e.target.checked })}
              data-testid="checkbox-edit-hide-sizes"
            />
            <Label htmlFor="edit-product-hide-sizes" className="cursor-pointer">
              Hide sizes (Show as "Free Size")
            </Label>
          </div>

          {/* Sizes and Colors Section */}
          {!editingProduct.hideSizes && (
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
                            onClick={() => {
                              const newSizePricing = { ...editingProduct.sizePricing };
                              delete newSizePricing[size];
                              setEditingProduct({
                                ...editingProduct,
                                sizes: editingProduct.sizes.filter(s => s !== size),
                                sizePricing: newSizePricing
                              });
                            }}
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
                        sizes: [...editingProduct.sizes, size],
                        sizePricing: { ...(editingProduct.sizePricing || {}), [size]: editingProduct.price }
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
                              sizes: [...editingProduct.sizes, value],
                              sizePricing: { ...(editingProduct.sizePricing || {}), [value]: editingProduct.price }
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
                            sizes: [...editingProduct.sizes, value],
                            sizePricing: { ...(editingProduct.sizePricing || {}), [value]: editingProduct.price }
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
            </div>
          )}

          {/* Size Pricing Section */}
          {!editingProduct.hideSizes && (
            <div>
              <Label>Size Pricing (LKR)</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-3 border rounded-md">
                {editingProduct.sizes && editingProduct.sizes.length > 0 ? (
                  editingProduct.sizes.map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <Label className="w-12 text-right">{size}:</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(editingProduct.sizePricing && editingProduct.sizePricing[size]) || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          sizePricing: { ...(editingProduct.sizePricing || {}), [size]: e.target.value }
                        })}
                        placeholder="0.00"
                        className="flex-1"
                        data-testid={`input-edit-size-price-${size.toLowerCase()}`}
                      />
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm col-span-2">Add sizes to set pricing</span>
                )}
              </div>
            </div>
          )}

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
              {editingProduct.images && editingProduct.images.length > 0 && (
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
              )}

              {/* Upload Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="edit-file-upload"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || !editingProduct.name || !editingProduct.categoryId}
                  data-testid="input-edit-file-upload"
                />
                <label
                  htmlFor="edit-file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${uploading || !editingProduct.name || !editingProduct.categoryId ? 'opacity-50 cursor-not-allowed' : ''
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
                  {(!editingProduct.name || !editingProduct.categoryId) && (
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
              data-testid="button-cancel-edit-product"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isPending}
              data-testid="button-submit-edit-product"
            >
              {isPending ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
