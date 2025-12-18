import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { SizeChart } from "@shared/schema";

interface SizeChartsTableProps {
    sizeCharts: SizeChart[];
    onEdit: (sizeChart: SizeChart) => void;
    onDelete: (id: string) => void;
}

export function SizeChartsTable({ sizeCharts, onEdit, onDelete }: SizeChartsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sizeCharts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500">
                                No size charts found
                            </TableCell>
                        </TableRow>
                    ) : (
                        sizeCharts.map((chart) => (
                            <TableRow key={chart.id}>
                                <TableCell className="font-medium">{chart.name}</TableCell>
                                <TableCell>{chart.description || "-"}</TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${chart.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {chart.is_active ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {chart.createdAt ? new Date(chart.createdAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(chart)}
                                            data-testid={`button-edit-size-chart-${chart.id}`}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(chart.id)}
                                            data-testid={`button-delete-size-chart-${chart.id}`}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
