import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const technicians = [
  { id: 1, name: "Brian Otieno", specialization: "GPS Installation", phone: "+254 712 111 222", email: "brian@staff.com", jobs: 5, status: "active" },
  { id: 2, name: "Kevin Njoroge", specialization: "GPS Installation & Repair", phone: "+254 723 222 333", email: "kevin@staff.com", jobs: 3, status: "active" },
  { id: 3, name: "Alice Akinyi", specialization: "Electrical Wiring", phone: "+254 734 333 444", email: "alice@staff.com", jobs: 0, status: "off-duty" },
  { id: 4, name: "Samuel Kipchoge", specialization: "Tracking Systems", phone: "+254 745 444 555", email: "samuel@staff.com", jobs: 7, status: "active" },
  { id: 5, name: "Diana Muthoni", specialization: "Fleet Management", phone: "+254 756 555 666", email: "diana@staff.com", jobs: 2, status: "active" },
  { id: 6, name: "Collins Odhiambo", specialization: "GPS Installation", phone: "+254 767 666 777", email: "collins@staff.com", jobs: 0, status: "inactive" },
];

export default function TechniciansPage() {
  const activeJobs = technicians.reduce((s, t) => s + t.jobs, 0);
  const available = technicians.filter((t) => t.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Technicians</h1>
          <p className="text-sm text-gray-500 mt-0.5">{available} available · {activeJobs} open jobs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Technician</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: technicians.length },
          { label: "Available", value: available },
          { label: "Off Duty", value: technicians.filter((t) => t.status === "off-duty").length },
          { label: "Active Jobs", value: activeJobs },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Technicians</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Specialization</th>
              <th className="px-6 py-3 text-left font-medium">Phone</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-right font-medium">Open Jobs</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {technicians.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{t.name}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{t.specialization}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{t.phone}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{t.email}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">{t.jobs}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={t.status === "active" ? "green" : t.status === "off-duty" ? "amber" : "gray"}>
                    {t.status === "active" ? "Active" : t.status === "off-duty" ? "Off Duty" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-right space-x-3">
                  <button className="text-xs text-blue-600 hover:underline font-medium">Assign</button>
                  <button className="text-xs text-gray-500 hover:underline font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
