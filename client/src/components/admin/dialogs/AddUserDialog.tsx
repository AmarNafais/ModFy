import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface UserFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailVerified: boolean;
}

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UserFormData) => void;
    isLoading?: boolean;
}

export function AddUserDialog({ open, onOpenChange, onSubmit, isLoading }: AddUserDialogProps) {
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'customer',
        isEmailVerified: false,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

    const validateForm = () => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

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
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset form when dialog closes
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                role: 'customer',
                isEmailVerified: false,
            });
            setErrors({});
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="John"
                            disabled={isLoading}
                        />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Doe"
                            disabled={isLoading}
                        />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john.doe@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Minimum 6 characters"
                            disabled={isLoading}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="role">
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
                            id="isEmailVerified"
                            checked={formData.isEmailVerified}
                            onCheckedChange={(checked) => setFormData({ ...formData, isEmailVerified: checked })}
                            disabled={isLoading}
                        />
                        <Label htmlFor="isEmailVerified" className="cursor-pointer">
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
                            {isLoading ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
