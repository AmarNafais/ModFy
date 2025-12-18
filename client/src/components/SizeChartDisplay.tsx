import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SizeChartDisplayProps {
    sizeChart: {
        name: string;
        description?: string;
        chartData: string[][];
    };
}

export function SizeChartDisplay({ sizeChart }: SizeChartDisplayProps) {
    if (!sizeChart?.chartData || sizeChart.chartData.length === 0) {
        return null;
    }

    const headers = sizeChart.chartData[0] || [];
    const rows = sizeChart.chartData.slice(1);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{sizeChart.name}</CardTitle>
                {sizeChart.description && (
                    <p className="text-sm text-muted-foreground">{sizeChart.description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {headers.map((header, index) => (
                                    <TableHead key={index} className="font-semibold">
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
