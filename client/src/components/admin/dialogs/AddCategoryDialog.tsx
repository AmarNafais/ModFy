import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryForm: CategoryFormData;
  setCategoryForm: (form: CategoryFormData) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  categoryForm,
  setCategoryForm,
  onSubmit,
  isPending
}: AddCategoryDialogProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const file = files[0];
      const formData = new FormData();
      const categoryName = categoryForm.name || 'category';

      formData.append('categoryName', categoryName);
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-category-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setCategoryForm({ ...categoryForm, imageUrl: data.imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2"
          data-testid="button-create-main-category"
          onClick={() => setCategoryForm({ ...categoryForm, parentId: '' })}
        >
          <Plus className="w-4 h-4" />
          Add Main Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto max-h-[70vh] overflow-y-auto">
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
            <Label htmlFor="category-image">Category Image</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="category-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('category-image-upload')?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
              {categoryForm.imageUrl && (
                <div className="relative w-full h-32 border rounded-md overflow-hidden">
                  <img
                    src={categoryForm.imageUrl}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isPending}
              data-testid="button-submit-category"
            >
              {isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
