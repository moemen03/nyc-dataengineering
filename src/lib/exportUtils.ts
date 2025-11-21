import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CollisionData } from "./dataLoader";

export const exportToCSV = (data: CollisionData[], filename: string = "nyc_collisions_export.csv") => {
  if (data.length === 0) return;

  // Select key fields for export
  const headers = [
    "CRASH_DATE",
    "CRASH_TIME",
    "BOROUGH",
    "LATITUDE",
    "LONGITUDE",
    "NUMBER_OF_PERSONS_INJURED",
    "NUMBER_OF_PERSONS_KILLED",
    "CONTRIBUTING_FACTOR_VEHICLE_1",
    "VEHICLE_TYPE_CODE_1",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof CollisionData];
          // Escape commas and quotes
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (elementId: string, filename: string = "nyc_collisions_report.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Temporarily expand the element
    const originalOverflow = element.style.overflow;
    element.style.overflow = "visible";

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    element.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const generateSummaryStats = (data: CollisionData[]) => {
  const uniqueCollisions = new Set(data.map((d) => d.COLLISION_ID)).size;
  const totalInjuries = data.reduce((sum, d) => sum + d.NUMBER_OF_PERSONS_INJURED, 0);
  const totalFatalities = data.reduce((sum, d) => sum + d.NUMBER_OF_PERSONS_KILLED, 0);

  const boroughStats = data.reduce((acc, d) => {
    if (!acc[d.BOROUGH]) {
      acc[d.BOROUGH] = { crashes: new Set(), injuries: 0, fatalities: 0 };
    }
    acc[d.BOROUGH].crashes.add(d.COLLISION_ID);
    acc[d.BOROUGH].injuries += d.NUMBER_OF_PERSONS_INJURED;
    acc[d.BOROUGH].fatalities += d.NUMBER_OF_PERSONS_KILLED;
    return acc;
  }, {} as Record<string, { crashes: Set<string>; injuries: number; fatalities: number }>);

  return {
    uniqueCollisions,
    totalInjuries,
    totalFatalities,
    boroughStats: Object.entries(boroughStats).map(([borough, stats]) => ({
      borough,
      crashes: stats.crashes.size,
      injuries: stats.injuries,
      fatalities: stats.fatalities,
    })),
  };
};
