import { Upload, Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const documents = [
  { id: 1, name: "Business Registration Certificate", type: "PDF", size: "1.2 MB", category: "Legal", uploadedBy: "Admin User", date: "2026-01-15", status: "verified" },
  { id: 2, name: "KRA PIN Certificate", type: "PDF", size: "0.4 MB", category: "Legal", uploadedBy: "Admin User", date: "2026-01-15", status: "verified" },
  { id: 3, name: "Q1 2026 Financial Report", type: "XLSX", size: "3.8 MB", category: "Finance", uploadedBy: "Admin User", date: "2026-04-05", status: "active" },
  { id: 4, name: "Supplier Contract - Teltonika", type: "PDF", size: "2.1 MB", category: "Contracts", uploadedBy: "Admin User", date: "2026-02-20", status: "active" },
  { id: 5, name: "Employee Handbook", type: "PDF", size: "4.5 MB", category: "HR", uploadedBy: "Admin User", date: "2026-01-01", status: "active" },
  { id: 6, name: "Vehicle Inspection Checklist", type: "DOCX", size: "0.8 MB", category: "Operations", uploadedBy: "Kevin Njoroge", date: "2026-05-10", status: "active" },
  { id: 7, name: "Bulk SMS Provider Agreement", type: "PDF", size: "1.6 MB", category: "Contracts", uploadedBy: "Admin User", date: "2026-03-12", status: "expiring" },
];

const typeIcon: Record<string, React.ElementType> = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  DOCX: File,
};

const statusVariant: Record<string, "green" | "blue" | "amber" | "gray"> = {
  verified: "green",
  active: "blue",
  expiring: "amber",
  archived: "gray",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{documents.length} files · 1 expiring soon</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export List</Button>
          <Button size="sm"><Upload className="h-3.5 w-3.5" /> Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Files", value: documents.length },
          { label: "Legal Docs", value: documents.filter((d) => d.category === "Legal").length },
          { label: "Contracts", value: documents.filter((d) => d.category === "Contracts").length },
          { label: "Expiring", value: documents.filter((d) => d.status === "expiring").length },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Documents</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Document</th>
              <th className="px-6 py-3 text-left font-medium">Category</th>
              <th className="px-6 py-3 text-left font-medium">Type</th>
              <th className="px-6 py-3 text-left font-medium">Size</th>
              <th className="px-6 py-3 text-left font-medium">Uploaded By</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {documents.map((doc) => {
              const Icon = typeIcon[doc.type] ?? File;
              return (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{doc.category}</td>
                  <td className="px-6 py-3.5 text-xs font-mono font-medium text-gray-600">{doc.type}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{doc.size}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{doc.uploadedBy}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{doc.date}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={statusVariant[doc.status]}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right space-x-3">
                    <button className="text-xs text-blue-600 hover:underline font-medium">Download</button>
                    <button className="text-xs text-gray-500 hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
