import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Edit, Trash2 } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  onAddUser?: () => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
}

export function UsersTable({ users, onAddUser, onEditUser, onDeleteUser }: UsersTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          Users Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(users) && users.map((user: any) => (
              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                <TableCell className="font-medium" data-testid={`text-user-name-${user.id}`}>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell data-testid={`text-user-email-${user.id}`}>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? "default" : "secondary"} data-testid={`badge-user-role-${user.id}`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isEmailVerified ? "default" : "destructive"} data-testid={`badge-email-verified-${user.id}`} className={user.isEmailVerified ? "bg-green-600 hover:bg-green-700" : ""}>
                    {user.isEmailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-user-created-${user.id}`}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser?.(user)}
                      data-testid={`button-edit-user-${user.id}`}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser?.(user.id)}
                      data-testid={`button-delete-user-${user.id}`}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
