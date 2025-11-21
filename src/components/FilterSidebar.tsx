import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface FilterSidebarProps {
  boroughs: string[];
  years: number[];
  vehicleTypes: string[];
  factors: string[];
  selectedBorough: string;
  selectedYear: string;
  selectedVehicle: string;
  selectedFactor: string;
  searchQuery: string;
  onBoroughChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onFactorChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export const FilterSidebar = ({
  boroughs,
  years,
  vehicleTypes,
  factors,
  selectedBorough,
  selectedYear,
  selectedVehicle,
  selectedFactor,
  searchQuery,
  onBoroughChange,
  onYearChange,
  onVehicleChange,
  onFactorChange,
  onSearchChange,
  onSearch,
}: FilterSidebarProps) => {
  return (
    <Card className="p-6 shadow-card h-fit sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Filters</h2>
      </div>

      <div className="space-y-5">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold">Search Query</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="e.g., Brooklyn 2022..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1"
            />
            <Button onClick={onSearch} size="icon" className="gradient-secondary">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Borough */}
        <div className="space-y-2">
          <Label htmlFor="borough" className="text-sm font-semibold">Borough</Label>
          <Select value={selectedBorough} onValueChange={onBoroughChange}>
            <SelectTrigger id="borough">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Boroughs</SelectItem>
              {boroughs.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-semibold">Year</Label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger id="year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicle" className="text-sm font-semibold">Vehicle Type</Label>
          <Select value={selectedVehicle} onValueChange={onVehicleChange}>
            <SelectTrigger id="vehicle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Vehicles</SelectItem>
              {vehicleTypes.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contributing Factor */}
        <div className="space-y-2">
          <Label htmlFor="factor" className="text-sm font-semibold">Contributing Factor</Label>
          <Select value={selectedFactor} onValueChange={onFactorChange}>
            <SelectTrigger id="factor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Factors</SelectItem>
              {factors.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info */}
        <Card className="p-4 bg-muted/50 border-primary/20">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="text-primary">ℹ️</span> How to Use
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Select filters from dropdowns</li>
            <li>• Use search for quick queries</li>
            <li>• Charts update automatically</li>
            <li>• Scroll to view all visualizations</li>
          </ul>
        </Card>
      </div>
    </Card>
  );
};
