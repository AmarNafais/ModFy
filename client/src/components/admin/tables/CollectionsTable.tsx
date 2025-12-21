import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import { useState, useMemo } from "react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) {
      return collections;
    }
    const query = searchQuery.toLowerCase();
    return collections.filter((collection) =>
      collection.name.toLowerCase().includes(query) ||
      collection.season.toLowerCase().includes(query) ||
      collection.year.toString().includes(query) ||
      (collection.description && collection.description.toLowerCase().includes(query))
    );
  }, [collections, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Collections Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter Collections</h3>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search collections by name, season, year, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
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
            {Array.isArray(filteredCollections) && filteredCollections.map((collection: any) => (
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
