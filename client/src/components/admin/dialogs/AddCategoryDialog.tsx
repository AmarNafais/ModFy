import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

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
