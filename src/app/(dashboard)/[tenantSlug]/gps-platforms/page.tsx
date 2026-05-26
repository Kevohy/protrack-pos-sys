import { Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const platforms = [
  { id: 1, name: "Wialon Hosting", provider: "Gurtam", vehicles: 148, subscription: 45000, renewal: "2026-06-01", apiKey: "wln_••••••••••4f2a", status: "active" },
  { id: 2, name: "TrackSolid Pro", provider: "Jointech", vehicles: 52, subscription: 12500, renewal: "2026-07-15", apiKey: "ts_••••••••••9c1b", status: "active" },
  { id: 3, name: "Navixy", provider: "Navixy LLC", vehicles: 23, subscription: 18000, renewal: "2026-05-31", apiKey: "nvx_••••••••••2e8d", status: "expiring" },
  { id: 4, name: "iTrack Easy", provider: "iTrack", vehicles: 0, subscription: 0, renewal: "—", apiKey: "itr_••••••••••7a3c", status: "inactive" },
];

const statusVariant: Record<string, "green" | "amber" | "red" | "gray"> = {
  active: "green",
  expiring: "amber",
  suspended: "red",
  inactive: "gray",
};

export default function GpsPlatformsPage() {
  const totalVehicles = platforms.reduce((s, p) => s + p.vehicles, 0);
  const totalCost = platforms.filter((p) => p.status !== "inactive").reduce((s, p) => s + p.subscription, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">GPS Platforms</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage connected tracking platforms and API integrations</p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> Add Platform
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Platforms", value: platforms.filter((p) => p.status === "active").length },
          { label: "Total Vehicles", value: totalVehicles },
          { label: "Monthly Cost", value: formatKES(totalCost) },
          { label: "Expiring Soon", value: platforms.filter((p) => p.status === "expiring").length },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                  <Badge variant={statusVariant[p.status]}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{p.provider}</p>
              </div>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-gray-900">{p.vehicles}</p>
                <p className="text-xs text-gray-500 mt-0.5">Vehicles</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-sm font-bold text-gray-900">{p.subscription > 0 ? formatKES(p.subscription) : "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Monthly</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-sm font-bold text-gray-900">{p.renewal}</p>
                <p className="text-xs text-gray-500 mt-0.5">Renewal</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">{p.apiKey}</span>
              <button className="text-xs text-blue-600 hover:underline font-medium">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
