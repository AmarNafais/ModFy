import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent_id?: string;
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: any;
  setEditingProduct: (product: any) => void;
  categories: Category[];
  editNewImageUrl: string;
  setEditNewImageUrl: (url: string) => void;
  removeEditImage: (index: number) => void;
  addEditImageUrl: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function EditProductDialog({
  open,
  onOpenChange,
  editingProduct,
  setEditingProduct,
  categories,
  editNewImageUrl,
  setEditNewImageUrl,
  removeEditImage,
  addEditImageUrl,
  onSubmit,
  isPending,
}: EditProductDialogProps) {
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
