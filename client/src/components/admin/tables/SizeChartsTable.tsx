import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Search, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import type { SizeChart } from "@shared/schema";

interface SizeChartsTableProps {
    sizeCharts: SizeChart[];
    onEdit: (sizeChart: SizeChart) => void;
    onDelete: (id: string) => void;
    createSizeChartTrigger?: React.ReactNode;
    onFilteredCountChange?: (count: number) => void;
}

export function SizeChartsTable({ sizeCharts, onEdit, onDelete, createSizeChartTrigger, onFilteredCountChange }: SizeChartsTableProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredSizeCharts = useMemo(() => {
        let filtered = sizeCharts;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((chart) =>
                chart.name.toLowerCase().includes(query) ||
                (chart.description && chart.description.toLowerCase().includes(query))
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            const isActive = statusFilter === "active";
            filtered = filtered.filter((chart) => chart.is_active === isActive);
        }

        return filtered;
    }, [sizeCharts, searchQuery, statusFilter]);

    // Notify parent of filtered count
    useMemo(() => {
        if (onFilteredCountChange) {
            onFilteredCountChange(filteredSizeCharts.length);
        }
    }, [filteredSizeCharts, onFilteredCountChange]);

    return (
        <Card>
            <CardContent>
                <div className="mb-6 mt-4">
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search size charts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[250px] pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                        {createSizeChartTrigger && (
                            <div className="flex items-center gap-2">
                                {createSizeChartTrigger}
                            </div>
                        )}
                    </div>
                </div>
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
                    {filteredSizeCharts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500">
                                No size charts found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredSizeCharts.map((chart) => (
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
        </CardContent>
    </Card>
    );
}
