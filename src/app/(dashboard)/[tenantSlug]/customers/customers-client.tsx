"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, X, Users, UserCheck, Building2, Briefcase,
  CheckCircle, AlertCircle, ChevronDown, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type CustomerType = "End User" | "Distributor" | "Company";

interface Customer {
  id: string;
  name: string;
  accountName: string;
  type: string;
  phone: string;
  email: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  type: CustomerType | "";
  name: string;
  accountName: string;
  phone: string;
  email: string;
  location: string;
}

interface FormErrors {
  type?: string;
  name?: string;
  accountName?: string;
  phone?: string;
  email?: string;
  [key: string]: string | undefined;
}

interface ToastData { message: string; type: "success" | "error" }

// ── Constants ─────────────────────────────────────────────────────────────────

const BLANK: FormState = { type: "", name: "", accountName: "", phone: "", email: "", location: "" };

const TYPES: { value: CustomerType; label: string; Icon: React.ElementType }[] = [
  { value: "End User",    label: "End User",    Icon: UserCheck },
  { value: "Distributor", label: "Distributor", Icon: Building2 },
  { value: "Company",     label: "Company",     Icon: Briefcase },
];

const STAT_CARDS = [
  { key: "all",         label: "All Customers", Icon: Users,      iconColor: "text-[#6c5ce7]",   iconBg: "bg-[#ede9fe]" },
  { key: "End User",    label: "End Users",      Icon: UserCheck,  iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  { key: "Distributor", label: "Distributors",   Icon: Building2,  iconColor: "text-blue-600",    iconBg: "bg-blue-50" },
  { key: "Company",     label: "Companies",      Icon: Briefcase,  iconColor: "text-amber-600",   iconBg: "bg-amber-50" },
] as const;

const TYPE_BADGE: Record<string, "green" | "blue" | "amber"> = {
  "End User":   "green",
  "Distributor": "blue",
  "Company":    "amber",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function titleCase(s: string): string {
  return s.split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : "")).join(" ");
}

function validateField(name: keyof FormState, value: string): string | undefined {
  switch (name) {
    case "type":        return !value ? "Please select a customer type" : undefined;
    case "name":        return !value.trim() ? "Full name is required" : undefined;
    case "accountName": return !value.trim() ? "Account name is required" : undefined;
    case "phone": {
      const d = value.replace(/\D/g, "");
      if (!d) return "Phone number is required";
      if (d.length < 9 || d.length > 12) return "Phone must be 9–12 digits";
      return undefined;
    }
    case "email":
      if (!value) return undefined;
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : undefined;
    default: return undefined;
  }
}

function validateAll(form: FormState): FormErrors {
  const errs: FormErrors = {};
  (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
    const e = validateField(k, form[k]);
    if (e) errs[k] = e;
  });
  return errs;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5",
        "rounded-2xl shadow-xl border w-[calc(100vw-3rem)] sm:w-auto sm:max-w-sm",
        data.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800",
      )}
    >
      {data.type === "success"
        ? <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        : <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
      <p className="text-sm font-semibold flex-1">{data.message}</p>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { initialCustomers: Customer[]; tenantSlug: string }

export function CustomersClient({ initialCustomers, tenantSlug }: Props) {

  // ── Table / filter state
  const [customers, setCustomers]     = useState<Customer[]>(initialCustomers);
  const [typeFilter, setTypeFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]           = useState("");

  // ── Modal state
  const [modalOpen, setModalOpen]           = useState(false);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [isDirty, setIsDirty]               = useState(false);
  const [showDiscard, setShowDiscard]       = useState(false);

  // ── Form state
  const [form, setForm]           = useState<FormState>(BLANK);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [touched, setTouched]     = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Toast
  const [toast, setToast] = useState<ToastData | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Escape key — re-register whenever isDirty or modalOpen changes
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isDirty) { setShowDiscard(true); } else { doClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived counts
  const counts = useMemo(() => ({
    all:          customers.length,
    "End User":   customers.filter((c) => c.type === "End User").length,
    "Distributor": customers.filter((c) => c.type === "Distributor").length,
    "Company":    customers.filter((c) => c.type === "Company").length,
  }), [customers]);

  // ── Filtered table rows
  const filtered = useMemo(() => customers
    .filter((c) => typeFilter === "all" || c.type === typeFilter)
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.accountName.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        c.phone.includes(q)
      );
    }), [customers, typeFilter, statusFilter, search]);

  // ── Modal controls ────────────────────────────────────────────────────────

  function doClose() {
    setModalOpen(false);
    setEditingId(null);
    setShowDiscard(false);
    setForm(BLANK);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }

  function tryClose() {
    if (isDirty) { setShowDiscard(true); } else { doClose(); }
  }

  function openAdd() {
    setForm(BLANK); setErrors({}); setTouched({});
    setIsDirty(false); setEditingId(null); setShowDiscard(false);
    setModalOpen(true);
  }

  function openEdit(c: Customer) {
    setForm({
      type:        c.type as CustomerType,
      name:        c.name,
      accountName: c.accountName,
      phone:       c.phone,
      email:       c.email ?? "",
      location:    c.location ?? "",
    });
    setErrors({}); setTouched({});
    setIsDirty(false); setEditingId(c.id); setShowDiscard(false);
    setModalOpen(true);
  }

  // ── Form handlers ─────────────────────────────────────────────────────────

  function change(name: keyof FormState, raw: string) {
    let v = raw;
    if (name === "name")        v = titleCase(raw);
    if (name === "accountName") v = raw.toUpperCase().replace(/\s/g, "");
    if (name === "location")    v = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;

    setForm((f) => ({ ...f, [name]: v }));
    setIsDirty(true);
    if (touched[name]) {
      setErrors((e) => ({ ...e, [name]: validateField(name, v) }));
    }
  }

  function blur(name: keyof FormState) {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validateField(name, form[name]) }));
  }

  function inputClass(name: keyof FormState) {
    return cn(
      "w-full px-4 py-2.5 text-sm rounded-[10px] bg-[#f8f9ff]",
      "border-[1.5px] outline-none transition-all duration-150 placeholder:text-gray-400",
      "focus:ring-2 focus:ring-offset-0",
      touched[name] && errors[name]
        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
        : touched[name] && form[name]
          ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20"
          : "border-[#e8eaf0] focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20",
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Touch all
    setTouched(Object.keys(form).reduce<Record<string, boolean>>((a, k) => ({ ...a, [k]: true }), {}));
    const errs = validateAll(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setToast({ message: "Please fix the errors before saving", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const url    = editingId ? `/api/${tenantSlug}/customers/${editingId}` : `/api/${tenantSlug}/customers`;
      const method = editingId ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        form.type,
          name:        form.name.trim(),
          accountName: form.accountName.trim(),
          phone:       form.phone.trim(),
          email:       form.email.trim() || null,
          location:    form.location.trim() || null,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error && typeof json.error === "object") {
          const fe: FormErrors = {};
          for (const [k, msgs] of Object.entries(json.error)) {
            fe[k] = (msgs as string[])[0];
          }
          setErrors(fe);
          setToast({ message: "Please fix the errors before saving", type: "error" });
        } else {
          setToast({ message: json.error ?? "Failed to save customer", type: "error" });
        }
        return;
      }

      if (editingId) {
        setCustomers((prev) => prev.map((c) => (c.id === editingId ? json.data : c)));
        setToast({ message: `Customer ${form.name} updated successfully!`, type: "success" });
      } else {
        setCustomers((prev) => [json.data, ...prev]);
        setToast({ message: `Customer ${form.name} added successfully!`, type: "success" });
      }
      doClose();
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {customers.length} total · {customers.filter((c) => c.status === "Active").length} active
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Customer
        </Button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const cnt      = counts[card.key as keyof typeof counts] ?? 0;
          const isActive = typeFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => setTypeFilter(card.key)}
              className={cn(
                "bg-white rounded-2xl border shadow-sm p-5 text-left transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/40 focus:ring-offset-2",
                isActive
                  ? "border-[#6c5ce7] ring-2 ring-[#6c5ce7]/20 shadow-md"
                  : "border-gray-100 hover:border-[#6c5ce7]/30 hover:shadow-md",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", card.iconBg)}>
                  <card.Icon className={cn("h-4 w-4", card.iconColor)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{cnt}</p>
              {isActive && (
                <p className="text-[10px] font-bold text-[#6c5ce7] mt-1 uppercase tracking-widest">
                  Active filter
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filters bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-sm font-bold text-gray-900 flex-1">All Customers</h2>

          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, account, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7]"
            />
          </div>

          {/* Type dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="End User">End User</option>
              <option value="Distributor">Distributor</option>
              <option value="Company">Company</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#f8f9fc] text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 text-left font-semibold">Name</th>
                <th className="px-6 py-3.5 text-left font-semibold">Account Name</th>
                <th className="px-6 py-3.5 text-left font-semibold">Type</th>
                <th className="px-6 py-3.5 text-left font-semibold">Phone</th>
                <th className="px-6 py-3.5 text-left font-semibold">Email</th>
                <th className="px-6 py-3.5 text-left font-semibold">Location</th>
                <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#ede9fe] flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#6c5ce7]" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">
                        {search || typeFilter !== "all" || statusFilter !== "all"
                          ? "No customers match your filters"
                          : "No customers yet — add your first!"}
                      </p>
                      {!search && typeFilter === "all" && statusFilter === "all" && (
                        <Button size="sm" onClick={openAdd}>
                          <Plus className="h-3.5 w-3.5" /> Add Customer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#faf8ff] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#ede9fe] flex items-center justify-center text-[#6c5ce7] font-bold text-xs flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 font-medium">{c.accountName}</td>
                    <td className="px-6 py-4">
                      <Badge variant={TYPE_BADGE[c.type] ?? "gray"}>{c.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.email ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.location ?? "—"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={c.status === "Active" ? "green" : "red"}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#6c5ce7] hover:underline"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {customers.length} customers
          </div>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            onClick={tryClose}
          />

          {/* Sheet / modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <div
              className={cn(
                "pointer-events-auto bg-white w-full sm:max-w-lg sm:mx-4",
                "rounded-t-[20px] sm:rounded-[20px]",
                "flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden",
              )}
              onClick={(e) => e.stopPropagation()}
            >

              {/* ── Discard confirmation overlay ── */}
              {showDiscard && (
                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 rounded-t-[20px] sm:rounded-[20px]">
                  <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xs">
                    <h3 className="text-sm font-bold text-gray-900">Discard changes?</h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      You have unsaved changes. Closing now will discard them permanently.
                    </p>
                    <div className="flex gap-2 mt-5">
                      <Button type="button" variant="outline" size="sm" className="flex-1"
                        onClick={() => setShowDiscard(false)}>
                        Stay
                      </Button>
                      <Button type="button" variant="danger" size="sm" className="flex-1"
                        onClick={doClose}>
                        Discard
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-sm font-bold text-gray-900">
                  {editingId ? "Edit Customer" : "Add New Customer"}
                </h2>
                <button
                  onClick={tryClose}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Unsaved changes warning */}
              {isDirty && (
                <div className="mx-6 mt-3 flex-shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
                </div>
              )}

              {/* Form (scrollable body) */}
              <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

                  {/* Customer Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Customer Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TYPES.map(({ value, label, Icon }) => {
                        const sel = form.type === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => change("type", value)}
                            className={cn(
                              "flex flex-col items-center gap-2 py-3.5 px-2 rounded-[14px] border-2 transition-all duration-150",
                              "focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/40 focus:ring-offset-2",
                              sel
                                ? "border-[#6c5ce7] bg-[#6c5ce7] text-white"
                                : "border-[#e8eaf0] bg-[#f8f9ff] text-gray-600 hover:border-[#6c5ce7]/50 hover:bg-[#ede9fe]/40",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-semibold">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {touched.type && errors.type && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.type}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => change("name", e.target.value)}
                      onBlur={() => blur("name")}
                      placeholder="e.g. Kelvin Kariuki"
                      className={inputClass("name")}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Each word auto-capitalised as you type</p>
                    {touched.name && errors.name && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>
                    )}
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.accountName}
                      onChange={(e) => change("accountName", e.target.value)}
                      onBlur={() => blur("accountName")}
                      placeholder="e.g. KELVINKARIUKI"
                      className={inputClass("accountName")}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Auto-uppercased · spaces removed · must be unique</p>
                    {touched.accountName && errors.accountName && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.accountName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => change("phone", e.target.value)}
                      onBlur={() => blur("phone")}
                      placeholder="e.g. 254712345678"
                      className={inputClass("phone")}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">9–12 digits (include country code)</p>
                    {touched.phone && errors.phone && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Email Address{" "}
                      <span className="text-gray-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => change("email", e.target.value)}
                      onBlur={() => blur("email")}
                      placeholder="e.g. kelvin@example.com"
                      className={inputClass("email")}
                    />
                    {touched.email && errors.email && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Location{" "}
                      <span className="text-gray-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => change("location", e.target.value)}
                      onBlur={() => blur("location")}
                      placeholder="e.g. Nairobi, Kenya"
                      className={inputClass("location")}
                    />
                  </div>

                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" size="md" onClick={tryClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" size="md" disabled={submitting}>
                    {submitting
                      ? (editingId ? "Updating…" : "Saving…")
                      : (editingId ? "Update Customer" : "Add Customer")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
