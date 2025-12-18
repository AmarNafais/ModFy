import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
}

interface EditUserFormData {
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
}

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (userId: string, data: EditUserFormData) => void;
    isLoading?: boolean;
    user: User | null;
}

export function EditUserDialog({ open, onOpenChange, onSubmit, isLoading, user }: EditUserDialogProps) {
    const [formData, setFormData] = useState<EditUserFormData>({
        firstName: '',
        lastName: '',
        role: 'customer',
        isEmailVerified: false,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof EditUserFormData, string>>>({});

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                role: user.role || 'customer',
                isEmailVerified: user.isEmailVerified || false,
            });
        }
    }, [user]);

    const validateForm = () => {
        const newErrors: Partial<Record<keyof EditUserFormData, string>> = {};

        if (!formData.firstName?.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = "Last name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm() && user) {
            onSubmit(user.id, formData);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setErrors({});
        }
        onOpenChange(newOpen);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            value={user.email}
                            disabled
                            className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-firstName">First Name *</Label>
                        <Input
                            id="edit-firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="John"
                            disabled={isLoading}
                        />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-lastName">Last Name *</Label>
                        <Input
                            id="edit-lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Doe"
                            disabled={isLoading}
                        />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="edit-role">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="edit-isEmailVerified"
                            checked={formData.isEmailVerified}
                            onCheckedChange={(checked) => setFormData({ ...formData, isEmailVerified: checked })}
                            disabled={isLoading}
                        />
                        <Label htmlFor="edit-isEmailVerified" className="cursor-pointer">
                            Email Verified
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}