import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;
}

interface AddSubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryForm: CategoryFormData;
  setCategoryForm: (form: CategoryFormData) => void;
  categories: Category[];
  onSubmit: () => void;
  isPending: boolean;
}

export function AddSubcategoryDialog({
  open,
  onOpenChange,
  categoryForm,
  setCategoryForm,
  categories,
  onSubmit,
  isPending
}: AddSubcategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2"
          data-testid="button-create-subcategory"
          onClick={() => setCategoryForm({ ...categoryForm, parentId: 'none' })}
        >
          <Plus className="w-4 h-4" />
          Add Subcategory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Subcategory</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="subcategory-name">Subcategory Name</Label>
            <Input
              id="subcategory-name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Enter subcategory name"
              data-testid="input-subcategory-name"
            />
          </div>
          <div>
            <Label htmlFor="subcategory-parent">Parent Category (Required)</Label>
            <Select
              value={categoryForm.parentId || "none"}
              onValueChange={(value) => setCategoryForm({ ...categoryForm, parentId: value === "none" ? "" : value })}
            >
              <SelectTrigger data-testid="select-subcategory-parent">
                <SelectValue placeholder="Select parent category" />
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
            <Label htmlFor="subcategory-description">Description</Label>
            <Textarea
              id="subcategory-description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Enter subcategory description"
              data-testid="textarea-subcategory-description"
            />
          </div>
          <div>
            <Label htmlFor="subcategory-image">Image URL</Label>
            <Input
              id="subcategory-image"
              value={categoryForm.imageUrl}
              onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              data-testid="input-subcategory-image"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-subcategory"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSubmit();
                onOpenChange(false);
              }}
              disabled={isPending || !categoryForm.parentId}
              data-testid="button-submit-subcategory"
            >
              {isPending ? 'Creating...' : 'Create Subcategory'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
