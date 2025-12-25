import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SizeChartsTable } from "@/components/admin/tables/SizeChartsTable";
import { SizeChartDialog } from "@/components/admin/dialogs/SizeChartDialog";

export default function AdminSizeCharts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isSizeChartDialogOpen, setIsSizeChartDialogOpen] = useState(false);
    const [editingSizeChart, setEditingSizeChart] = useState<any>(null);
    const [sizeChartMode, setSizeChartMode] = useState<"create" | "edit">("create");
    const [filteredCount, setFilteredCount] = useState(0);

    const { data: sizeCharts = [] } = useQuery({
        queryKey: ["/api/admin/size-charts"],
    });

    const createSizeChartMutation = useMutation({
        mutationFn: (sizeChart: any) =>
            apiRequest("POST", "/api/admin/size-charts", sizeChart),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/size-charts"] });
            setIsSizeChartDialogOpen(false);
            setEditingSizeChart(null);
            toast({
                title: "Size Chart Created",
                description: "Size chart created successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create size chart.",
                variant: "destructive",
            });
        },
    });

    const updateSizeChartMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiRequest("PATCH", `/api/admin/size-charts/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/size-charts"] });
            setIsSizeChartDialogOpen(false);
            setEditingSizeChart(null);
            toast({
                title: "Size Chart Updated",
                description: "Size chart updated successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update size chart.",
                variant: "destructive",
            });
        },
    });

    const deleteSizeChartMutation = useMutation({
        mutationFn: (id: string) =>
            apiRequest("DELETE", `/api/admin/size-charts/${id}`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/size-charts"] });
            toast({
                title: "Size Chart Deleted",
                description: "Size chart deleted successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete size chart.",
                variant: "destructive",
            });
        },
    });

    const handleCreateSizeChart = () => {
        setSizeChartMode("create");
        setEditingSizeChart({
            name: "",
            description: "",
            chartData: [["", ""], ["", ""]],
            is_active: true,
        });
        setIsSizeChartDialogOpen(true);
    };

    const handleEditSizeChart = (chart: any) => {
        setSizeChartMode("edit");
        setEditingSizeChart(chart);
        setIsSizeChartDialogOpen(true);
    };

    const handleDeleteSizeChart = (id: string) => {
        if (confirm("Are you sure you want to delete this size chart?")) {
            deleteSizeChartMutation.mutate(id);
        }
    };

    const handleSubmitSizeChart = () => {
        if (sizeChartMode === "create") {
            createSizeChartMutation.mutate(editingSizeChart);
        } else {
            updateSizeChartMutation.mutate({
                id: editingSizeChart.id,
                data: editingSizeChart,
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">Size Charts</h1>
                        <span className="text-2xl font-semibold text-black">
                            ({filteredCount || sizeCharts.length}{filteredCount < sizeCharts.length ? ` / ${sizeCharts.length}` : ''})
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        Manage size charts for your products
                    </p>
                </div>
            </div>

            <SizeChartsTable
                sizeCharts={sizeCharts as any[]}
                onEdit={handleEditSizeChart}
                onDelete={handleDeleteSizeChart}
                onFilteredCountChange={setFilteredCount}
                createSizeChartTrigger={
                    <Button onClick={handleCreateSizeChart}>
                        <Plus className="w-4 h-4 mr-2" /> Create Size Chart
                    </Button>
                }
            />

            <SizeChartDialog
                open={isSizeChartDialogOpen}
                onOpenChange={setIsSizeChartDialogOpen}
                sizeChart={editingSizeChart}
                setSizeChart={setEditingSizeChart}
                onSubmit={handleSubmitSizeChart}
                isPending={sizeChartMode === "create" ? createSizeChartMutation.isPending : updateSizeChartMutation.isPending}
                mode={sizeChartMode}
            />
        </div>
    );
}
