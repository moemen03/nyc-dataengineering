import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { CollisionData } from "@/lib/dataLoader";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  data: CollisionData[];
  reportElementId?: string;
}

export const ExportButton = ({ data, reportElementId = "dashboard-content" }: ExportButtonProps) => {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      exportToCSV(data);
      toast({
        title: "Export Successful",
        description: `${data.length.toLocaleString()} records exported to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "This may take a moment",
      });
      await exportToPDF(reportElementId);
      toast({
        title: "Export Successful",
        description: "Report exported to PDF",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report to PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gradient-secondary gap-2 hover:scale-105 transition-transform">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
