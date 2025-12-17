import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  season: string;
  year: number;
  description: string;
}

interface CollectionsTableProps {
  collections: Collection[];
}

export function CollectionsTable({ collections }: CollectionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Collections Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(collections) && collections.map((collection: any) => (
              <TableRow key={collection.id} data-testid={`row-collection-${collection.id}`}>
                <TableCell className="font-medium" data-testid={`text-collection-name-${collection.id}`}>
                  {collection.name}
                </TableCell>
                <TableCell data-testid={`text-collection-season-${collection.id}`}>
                  {collection.season}
                </TableCell>
                <TableCell data-testid={`text-collection-year-${collection.id}`}>
                  {collection.year}
                </TableCell>
                <TableCell data-testid={`text-collection-description-${collection.id}`}>
                  {collection.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
