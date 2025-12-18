import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface SizeChartDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sizeChart: any;
    setSizeChart: (chart: any) => void;
    onSubmit: () => void;
    isPending: boolean;
    mode: "create" | "edit";
}

export function SizeChartDialog({
    open,
    onOpenChange,
    sizeChart,
    setSizeChart,
    onSubmit,
    isPending,
    mode,
}: SizeChartDialogProps) {
    const [tableData, setTableData] = useState<string[][]>([["", ""], ["", ""]]);

    useEffect(() => {
        if (sizeChart?.chartData && Array.isArray(sizeChart.chartData) && sizeChart.chartData.length > 0) {
            setTableData(sizeChart.chartData);
        } else {
            setTableData([["", ""], ["", ""]]);
        }
    }, [sizeChart]);

    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newData = [...tableData];
        newData[rowIndex][colIndex] = value;
        setTableData(newData);
        setSizeChart({ ...(sizeChart || {}), chartData: newData });
    };

    const addRow = () => {
        const newRow = new Array(tableData[0].length).fill("");
        const newData = [...tableData, newRow];
        setTableData(newData);
        setSizeChart({ ...(sizeChart || {}), chartData: newData });
    };

    const removeRow = (rowIndex: number) => {
        if (tableData.length <= 2) return; // Keep at least header and one data row
        const newData = tableData.filter((_, index) => index !== rowIndex);
        setTableData(newData);
        setSizeChart({ ...(sizeChart || {}), chartData: newData });
    };

    const addColumn = () => {
        const newData = tableData.map(row => [...row, ""]);
        setTableData(newData);
        setSizeChart({ ...(sizeChart || {}), chartData: newData });
    };

    const removeColumn = (colIndex: number) => {
        if (tableData[0].length <= 2) return; // Keep at least 2 columns
        const newData = tableData.map(row => row.filter((_, index) => index !== colIndex));
        setTableData(newData);
        setSizeChart({ ...(sizeChart || {}), chartData: newData });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create Size Chart" : "Edit Size Chart"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="chart-name">Chart Name</Label>
                        <Input
                            id="chart-name"
                            value={sizeChart?.name || ""}
                            onChange={(e) => setSizeChart({ ...(sizeChart || {}), name: e.target.value })}
                            placeholder="e.g., Men's Underwear Size Chart"
                            data-testid="input-chart-name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="chart-description">Description (Optional)</Label>
                        <Textarea
                            id="chart-description"
                            value={sizeChart?.description || ""}
                            onChange={(e) => setSizeChart({ ...(sizeChart || {}), description: e.target.value })}
                            placeholder="Additional information about this size chart"
                            data-testid="textarea-chart-description"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Size Chart Table</Label>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Column
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Row
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-md overflow-x-auto">
                            <table className="w-full">
                                <tbody>
                                    {tableData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex === 0 ? "bg-gray-50" : ""}>
                                            {row.map((cell, colIndex) => (
                                                <td key={colIndex} className="border p-1">
                                                    <Input
                                                        value={cell}
                                                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                                        placeholder={rowIndex === 0 ? "Header" : "Value"}
                                                        className="border-0 focus-visible:ring-0"
                                                        data-testid={`input-cell-${rowIndex}-${colIndex}`}
                                                    />
                                                </td>
                                            ))}
                                            <td className="border p-1 w-16 text-center">
                                                {rowIndex > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRow(rowIndex)}
                                                        data-testid={`button-remove-row-${rowIndex}`}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        {tableData[0].map((_, colIndex) => (
                                            <td key={colIndex} className="border p-1 text-center">
                                                {colIndex > 0 && tableData[0].length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeColumn(colIndex)}
                                                        data-testid={`button-remove-column-${colIndex}`}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </td>
                                        ))}
                                        <td className="border p-1"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            First row will be treated as table headers
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="chart-active"
                            checked={sizeChart?.is_active ?? true}
                            onChange={(e) => setSizeChart({ ...(sizeChart || {}), is_active: e.target.checked })}
                            data-testid="checkbox-chart-active"
                        />
                        <Label htmlFor="chart-active">Active</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            data-testid="button-cancel-chart"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={isPending || !sizeChart?.name}
                            data-testid="button-submit-chart"
                        >
                            {isPending ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create" : "Update")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
