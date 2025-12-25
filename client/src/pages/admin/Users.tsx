import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UsersTable } from "@/components/admin/tables";
import { AddUserDialog, EditUserDialog } from "@/components/admin/dialogs";

export default function AdminUsers() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [filteredCount, setFilteredCount] = useState(0);

    const { data: users = [] } = useQuery({
        queryKey: ["/api/admin/users"],
    });

    const createUserMutation = useMutation({
        mutationFn: (userData: any) =>
            apiRequest("POST", "/api/admin/users", userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            setIsUserDialogOpen(false);
            toast({
                title: "User Created",
                description: "User created successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create user.",
                variant: "destructive",
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) =>
            apiRequest("DELETE", `/api/admin/users/${userId}`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({
                title: "User Deleted",
                description: "User deleted successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete user.",
                variant: "destructive",
            });
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: any }) =>
            apiRequest("PATCH", `/api/admin/users/${userId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
            setIsEditUserDialogOpen(false);
            setEditingUser(null);
            toast({
                title: "User Updated",
                description: "User updated successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update user.",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <span className="text-2xl font-semibold text-black">
                            ({filteredCount || users.length}{filteredCount < users.length ? ` / ${users.length}` : ''})
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        Manage user accounts
                    </p>
                </div>
                <AddUserDialog
                    open={isUserDialogOpen}
                    onOpenChange={setIsUserDialogOpen}
                    onSubmit={(userData) => createUserMutation.mutate(userData)}
                    isLoading={createUserMutation.isPending}
                />
            </div>

            <UsersTable
                users={users as any[]}
                onEditUser={(user) => {
                    setEditingUser(user);
                    setIsEditUserDialogOpen(true);
                }}
                onDeleteUser={(userId) => {
                    if (confirm('Are you sure you want to delete this user?')) {
                        deleteUserMutation.mutate(userId);
                    }
                }}
            />

            <EditUserDialog
                open={isEditUserDialogOpen}
                onOpenChange={setIsEditUserDialogOpen}
                user={editingUser}
                onSubmit={(userId, data) => updateUserMutation.mutate({ userId, data })}
                isLoading={updateUserMutation.isPending}
            />
        </div>
    );
}
