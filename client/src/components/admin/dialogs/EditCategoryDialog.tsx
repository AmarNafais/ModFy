import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useState } from "react";

interface Category {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    parent_id?: string;
}

interface EditCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCategory: any;
    setEditingCategory: (category: any) => void;
    categories: Category[];
    onSubmit: () => void;
    isPending: boolean;
}

export function EditCategoryDialog({
    open,
    onOpenChange,
    editingCategory,
    setEditingCategory,
    categories,
    onSubmit,
    isPending
}: EditCategoryDialogProps) {
    const [uploading, setUploading] = useState(false);

    if (!editingCategory) return null;

    const isSubcategory = !!editingCategory.parent_id;
    const mainCategories = categories.filter((cat: any) => !cat.parent_id);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            const file = files[0];
            const formData = new FormData();
            const categoryName = editingCategory.name || 'category';

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
            setEditingCategory({ ...editingCategory, imageUrl: data.imageUrl });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit {isSubcategory ? 'Subcategory' : 'Category'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="edit-category-name">{isSubcategory ? 'Subcategory' : 'Category'} Name</Label>
                        <Input
                            id="edit-category-name"
                            value={editingCategory.name || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            placeholder="Enter name"
                            data-testid="input-edit-category-name"
                        />
                    </div>

                    {isSubcategory && (
                        <div>
                            <Label htmlFor="edit-category-parent">Parent Category</Label>
                            <Select
                                value={editingCategory.parent_id || undefined}
                                onValueChange={(value) => setEditingCategory({ ...editingCategory, parent_id: value })}
                            >
                                <SelectTrigger data-testid="select-edit-parent-category">
                                    <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mainCategories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="edit-category-description">Description</Label>
                        <Textarea
                            id="edit-category-description"
                            value={editingCategory.description || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            placeholder="Enter description"
                            data-testid="textarea-edit-category-description"
                        />
                    </div>

                    {!isSubcategory && (
                        <div>
                            <Label htmlFor="edit-category-image">Category Image</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="hidden"
                                        id="edit-category-image-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('edit-category-image-upload')?.click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </Button>
                                </div>
                                {(editingCategory.imageUrl || editingCategory.image_url) && (
                                    <div className="relative w-full h-32 border rounded-md overflow-hidden">
                                        <img
                                            src={editingCategory.imageUrl || editingCategory.image_url}
                                            alt="Category preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            data-testid="button-cancel-edit-category"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={isPending}
                            data-testid="button-submit-edit-category"
                        >
                            {isPending ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
