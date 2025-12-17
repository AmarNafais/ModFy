import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon } from "lucide-react";

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
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
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
                  <Badge variant={user.isEmailVerified ? "default" : "destructive"} data-testid={`badge-email-verified-${user.id}`}>
                    {user.isEmailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </TableCell>
                <TableCell data-testid={`text-user-created-${user.id}`}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
