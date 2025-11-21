import { useState, useEffect, useMemo } from "react";
import { AlertCircle, TrendingUp, Users, Activity, Map, BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ChartCard } from "@/components/ChartCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DateRangePicker } from "@/components/DateRangePicker";
import { CollisionMap } from "@/components/CollisionMap";
import { HeatmapCalendar } from "@/components/HeatmapCalendar";
import { TrendAnalysis } from "@/components/TrendAnalysis";
import { ExportButton } from "@/components/ExportButton";
import { loadCollisionData, CollisionData } from "@/lib/dataLoader";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const Index = () => {
  const [data, setData] = useState<CollisionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorough, setSelectedBorough] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState("All");
  const [selectedFactor, setSelectedFactor] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("charts");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collisionData = await loadCollisionData();
        setData(collisionData);
        toast({
          title: "Data Loaded Successfully",
          description: `${collisionData.length.toLocaleString()} collision records loaded`,
        });
      } catch (error) {
        toast({
          title: "Error Loading Data",
          description: "Failed to load collision data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const validBoroughs = ["BROOKLYN", "QUEENS", "MANHATTAN", "BRONX", "STATEN ISLAND"];
    const boroughs = Array.from(
      new Set(data.map((d) => d.BOROUGH).filter((b) => validBoroughs.includes(b)))
    ).sort();

    const years = Array.from(new Set(data.map((d) => d.YEAR).filter((y) => !isNaN(y)))).sort();

    const vehicleTypes = Array.from(
      new Set(
        data
          .map((d) => d.VEHICLE_TYPE_CODE_1)
          .filter((v) => v && v !== "UNSPECIFIED" && v !== "nan")
      )
    )
      .sort()
      .slice(0, 20);

    const factors = Array.from(
      new Set(
        data
          .map((d) => d.CONTRIBUTING_FACTOR_VEHICLE_1)
          .filter((f) => f && f !== "UNSPECIFIED" && f !== "nan")
      )
    )
      .sort()
      .slice(0, 20);

    return { boroughs, years, vehicleTypes, factors };
  }, [data]);

  // Process search query
  const processedFilters = useMemo(() => {
    let borough = selectedBorough;
    let year = selectedYear;

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      if (lower.includes("brooklyn")) borough = "BROOKLYN";
      else if (lower.includes("manhattan")) borough = "MANHATTAN";
      else if (lower.includes("bronx")) borough = "BRONX";
      else if (lower.includes("queens")) borough = "QUEENS";
      else if (lower.includes("staten")) borough = "STATEN ISLAND";

      filterOptions.years.forEach((y) => {
        if (searchQuery.includes(y.toString())) year = y.toString();
      });
    }

    return { borough, year };
  }, [searchQuery, selectedBorough, selectedYear, filterOptions.years]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (processedFilters.borough !== "All" && d.BOROUGH !== processedFilters.borough) return false;
      if (processedFilters.year !== "All" && d.YEAR.toString() !== processedFilters.year) return false;
      if (selectedVehicle !== "All" && d.VEHICLE_TYPE_CODE_1 !== selectedVehicle) return false;
      if (selectedFactor !== "All" && d.CONTRIBUTING_FACTOR_VEHICLE_1 !== selectedFactor) return false;
      
      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const crashDate = new Date(d.CRASH_DATE);
        if (dateRange.from && crashDate < dateRange.from) return false;
        if (dateRange.to && crashDate > dateRange.to) return false;
      }
      
      return true;
    });
  }, [data, processedFilters, selectedVehicle, selectedFactor, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const uniqueCollisions = new Set(filteredData.map((d) => d.COLLISION_ID)).size;
    const totalInjuries = filteredData.reduce((sum, d) => sum + d.NUMBER_OF_PERSONS_INJURED, 0);
    const totalFatalities = filteredData.reduce((sum, d) => sum + d.NUMBER_OF_PERSONS_KILLED, 0);
    
    const dates = filteredData.map((d) => new Date(d.CRASH_DATE)).filter((d) => !isNaN(d.getTime()));
    const dateRange = dates.length > 0 
      ? (Math.max(...dates.map(d => d.getTime())) - Math.min(...dates.map(d => d.getTime()))) / (1000 * 60 * 60 * 24)
      : 1;
    const avgPerDay = uniqueCollisions / Math.max(1, dateRange);

    return {
      totalCrashes: uniqueCollisions,
      totalInjuries,
      totalFatalities,
      avgPerDay,
    };
  }, [filteredData]);

  // Chart data
  const chartData = useMemo(() => {
    const validBoroughs = ["BROOKLYN", "QUEENS", "MANHATTAN", "BRONX", "STATEN ISLAND"];
    
    // Crashes by borough
    const boroughCounts = validBoroughs.map((borough) => ({
      name: borough,
      value: new Set(filteredData.filter((d) => d.BOROUGH === borough).map((d) => d.COLLISION_ID))
        .size,
    }));

    // Crashes by year
    const yearCounts = Array.from(
      new Set(filteredData.map((d) => d.YEAR))
    )
      .sort()
      .map((year) => ({
        name: year.toString(),
        value: new Set(filteredData.filter((d) => d.YEAR === year).map((d) => d.COLLISION_ID))
          .size,
      }));

    // Crashes by hour
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({
      name: `${i}:00`,
      value: new Set(filteredData.filter((d) => d.HOUR === i).map((d) => d.COLLISION_ID)).size,
    }));

    // Crashes by day of week
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayCounts = Array.from({ length: 7 }, (_, i) => ({
      name: dayNames[i],
      value: new Set(filteredData.filter((d) => d.DAY_OF_WEEK === i).map((d) => d.COLLISION_ID))
        .size,
    }));

    // Top contributing factors
    const factorCounts = Object.entries(
      filteredData
        .filter((d) => d.CONTRIBUTING_FACTOR_VEHICLE_1 && d.CONTRIBUTING_FACTOR_VEHICLE_1 !== "UNSPECIFIED")
        .reduce((acc, d) => {
          acc[d.CONTRIBUTING_FACTOR_VEHICLE_1] = (acc[d.CONTRIBUTING_FACTOR_VEHICLE_1] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Top vehicle types
    const vehicleCounts = Object.entries(
      filteredData
        .filter((d) => d.VEHICLE_TYPE_CODE_1 && d.VEHICLE_TYPE_CODE_1 !== "UNSPECIFIED")
        .reduce((acc, d) => {
          acc[d.VEHICLE_TYPE_CODE_1] = (acc[d.VEHICLE_TYPE_CODE_1] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Casualties by borough
    const casualties = validBoroughs.map((borough) => {
      const boroughData = filteredData.filter((d) => d.BOROUGH === borough);
      return {
        name: borough,
        injured: boroughData.reduce((sum, d) => sum + d.NUMBER_OF_PERSONS_INJURED, 0),
        killed: boroughData.reduce((sum, d) => sum + d.NUMBER_OF_PERSONS_KILLED, 0),
      };
    });

    // Severity distribution for pie chart
    const severityData = [
      {
        name: "Property Damage Only",
        value: filteredData.filter(
          (d) => d.NUMBER_OF_PERSONS_INJURED === 0 && d.NUMBER_OF_PERSONS_KILLED === 0
        ).length,
      },
      {
        name: "Minor Injuries",
        value: filteredData.filter(
          (d) => d.NUMBER_OF_PERSONS_INJURED > 0 && d.NUMBER_OF_PERSONS_INJURED <= 2 && d.NUMBER_OF_PERSONS_KILLED === 0
        ).length,
      },
      {
        name: "Major Injuries",
        value: filteredData.filter(
          (d) => d.NUMBER_OF_PERSONS_INJURED > 2 && d.NUMBER_OF_PERSONS_KILLED === 0
        ).length,
      },
      {
        name: "Fatal",
        value: filteredData.filter((d) => d.NUMBER_OF_PERSONS_KILLED > 0).length,
      },
    ];

    return {
      boroughCounts,
      yearCounts,
      hourCounts,
      dayCounts,
      factorCounts,
      vehicleCounts,
      casualties,
      severityData,
    };
  }, [filteredData]);

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  const SEVERITY_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-3))", "hsl(var(--accent))", "hsl(var(--destructive))"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading collision data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-6 shadow-elevated relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">NYC Collisions Analytics</h1>
                <p className="text-sm text-white/80 mt-1">Advanced Traffic Intelligence Platform</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ExportButton data={filteredData} />
              <ThemeToggle />
            </div>
          </div>
          <p className="text-lg text-white/90 animate-fade-in-up">
            Comprehensive analysis of traffic incidents across New York City (2012-2025)
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8" id="dashboard-content">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <MetricCard
            title="Total Crashes"
            value={metrics.totalCrashes.toLocaleString()}
            icon={AlertCircle}
            colorClass="text-primary"
          />
          <MetricCard
            title="Total Injuries"
            value={metrics.totalInjuries.toLocaleString()}
            icon={Users}
            colorClass="text-accent"
          />
          <MetricCard
            title="Total Fatalities"
            value={metrics.totalFatalities.toLocaleString()}
            icon={TrendingUp}
            colorClass="text-destructive"
          />
          <MetricCard
            title="Avg Crashes/Day"
            value={metrics.avgPerDay.toFixed(1)}
            icon={Activity}
            colorClass="text-secondary"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 animate-slide-in-right">
            <FilterSidebar
              boroughs={filterOptions.boroughs}
              years={filterOptions.years}
              vehicleTypes={filterOptions.vehicleTypes}
              factors={filterOptions.factors}
              selectedBorough={selectedBorough}
              selectedYear={selectedYear}
              selectedVehicle={selectedVehicle}
              selectedFactor={selectedFactor}
              searchQuery={searchQuery}
              onBoroughChange={setSelectedBorough}
              onYearChange={setSelectedYear}
              onVehicleChange={setSelectedVehicle}
              onFactorChange={setSelectedFactor}
              onSearchChange={setSearchQuery}
              onSearch={() => {}}
            />
            
            {/* Date Range Picker */}
            <div className="mt-6">
              <ChartCard title="Date Range Filter" className="p-4">
                <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
              </ChartCard>
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Crashes by Borough">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.boroughCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Crashes Over Time">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.yearCounts}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--chart-2))", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Crashes by Hour of Day">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.hourCounts}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Crashes by Day of Week">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.dayCounts}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.dayCounts.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Top Contributing Factors">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData.factorCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Vehicle Types">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData.vehicleCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Casualties by Borough">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData.casualties}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="injured" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} name="Injured" />
                    <Bar dataKey="killed" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} name="Killed" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Collision Severity Distribution">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={chartData.severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
              </TabsContent>

              {/* Map Tab */}
              <TabsContent value="map">
                <ChartCard title="Collision Locations" className="h-[600px]">
                  <CollisionMap data={filteredData} />
                </ChartCard>
              </TabsContent>

              {/* Heatmap Tab */}
              <TabsContent value="heatmap">
                <ChartCard title="Collision Patterns: Day vs Hour">
                  <HeatmapCalendar data={filteredData} />
                </ChartCard>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6">
                <ChartCard title="Trend Analysis & Predictions">
                  <TrendAnalysis data={filteredData} />
                </ChartCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChartCard title="Year-over-Year Comparison">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.yearCounts}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--chart-2))", r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Borough Comparison">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.boroughCounts}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {chartData.boroughCounts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="gradient-primary text-white mt-16 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="text-sm text-white/90 mb-2">
            Data Source: NYC Open Data | Built with React, TypeScript, Recharts & Leaflet
          </p>
          <p className="text-xs text-white/70">
            Advanced Analytics Platform for Traffic Safety Research
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
