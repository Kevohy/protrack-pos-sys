"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, X, Truck, ShoppingBag, Wrench, Package,
  CheckCircle, AlertCircle, ChevronDown, Pencil, PowerOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type SupplierCategory = "Goods" | "Services" | "Equipment";

interface Supplier {
  id: string;
  tenantId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  category: string;
  location: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: SupplierCategory | "";
  location: string;
  notes: string;
}

interface FormErrors {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  category?: string;
  [key: string]: string | undefined;
}

interface ToastData { message: string; type: "success" | "error" }

// ── Constants ─────────────────────────────────────────────────────────────────

const BLANK: FormState = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  category: "",
  location: "",
  notes: "",
};

const CATEGORIES: { value: SupplierCategory; label: string; Icon: React.ElementType }[] = [
  { value: "Goods",     label: "Goods",     Icon: ShoppingBag },
  { value: "Services",  label: "Services",  Icon: Wrench },
  { value: "Equipment", label: "Equipment", Icon: Package },
];

const STAT_CARDS = [
  { key: "all",       label: "All Suppliers", Icon: Truck,       iconColor: "text-[#6c5ce7]",   iconBg: "bg-[#ede9fe]" },
  { key: "Goods",     label: "Goods",         Icon: ShoppingBag, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  { key: "Services",  label: "Services",      Icon: Wrench,      iconColor: "text-blue-600",    iconBg: "bg-blue-50" },
  { key: "Equipment", label: "Equipment",     Icon: Package,     iconColor: "text-amber-600",   iconBg: "bg-amber-50" },
] as const;

const CATEGORY_BADGE: Record<string, "green" | "blue" | "amber"> = {
  "Goods":     "green",
  "Services":  "blue",
  "Equipment": "amber",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function titleCase(s: string): string {
  return s.split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : "")).join(" ");
}

function validateField(name: keyof FormState, value: string): string | undefined {
  switch (name) {
    case "companyName":   return !value.trim() ? "Company name is required" : undefined;
    case "contactPerson": return !value.trim() ? "Contact person is required" : undefined;
    case "category":      return !value ? "Please select a category" : undefined;
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

interface Props { initialSuppliers: Supplier[]; tenantSlug: string }

export function SuppliersClient({ initialSuppliers, tenantSlug }: Props) {

  // ── Table / filter state
  const [suppliers, setSuppliers]       = useState<Supplier[]>(initialSuppliers);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");

  // ── Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [isDirty, setIsDirty]         = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  // ── Deactivate confirm state
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [deactivating, setDeactivating]     = useState(false);

  // ── Form state
  const [form, setForm]         = useState<FormState>(BLANK);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Toast
  const [toast, setToast] = useState<ToastData | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Escape key
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
    all:         suppliers.length,
    "Goods":     suppliers.filter((s) => s.category === "Goods").length,
    "Services":  suppliers.filter((s) => s.category === "Services").length,
    "Equipment": suppliers.filter((s) => s.category === "Equipment").length,
  }), [suppliers]);

  // ── Filtered rows
  const filtered = useMemo(() => suppliers
    .filter((s) => categoryFilter === "all" || s.category === categoryFilter)
    .filter((s) => statusFilter === "all" || s.status === statusFilter)
    .filter((s) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.companyName.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        (s.email?.toLowerCase().includes(q) ?? false) ||
        s.phone.includes(q) ||
        (s.location?.toLowerCase().includes(q) ?? false)
      );
    }), [suppliers, categoryFilter, statusFilter, search]);

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

  function openEdit(s: Supplier) {
    setForm({
      companyName:   s.companyName,
      contactPerson: s.contactPerson,
      phone:         s.phone,
      email:         s.email ?? "",
      category:      s.category as SupplierCategory,
      location:      s.location ?? "",
      notes:         s.notes ?? "",
    });
    setErrors({}); setTouched({});
    setIsDirty(false); setEditingId(s.id); setShowDiscard(false);
    setModalOpen(true);
  }

  // ── Form handlers ─────────────────────────────────────────────────────────

  function change(name: keyof FormState, raw: string) {
    let v = raw;
    if (name === "companyName" || name === "contactPerson") v = titleCase(raw);
    if (name === "location") v = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;

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

    setTouched(Object.keys(form).reduce<Record<string, boolean>>((a, k) => ({ ...a, [k]: true }), {}));
    const errs = validateAll(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setToast({ message: "Please fix the errors before saving", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const url    = editingId ? `/api/${tenantSlug}/suppliers/${editingId}` : `/api/${tenantSlug}/suppliers`;
      const method = editingId ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName:   form.companyName.trim(),
          contactPerson: form.contactPerson.trim(),
          phone:         form.phone.trim(),
          email:         form.email.trim() || null,
          category:      form.category,
          location:      form.location.trim() || null,
          notes:         form.notes.trim() || null,
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
          setToast({ message: json.error ?? "Failed to save supplier", type: "error" });
        }
        return;
      }

      if (editingId) {
        setSuppliers((prev) => prev.map((s) => (s.id === editingId ? json.data : s)));
        setToast({ message: `${form.companyName} updated successfully!`, type: "success" });
      } else {
        setSuppliers((prev) => [json.data, ...prev]);
        setToast({ message: `${form.companyName} added successfully!`, type: "success" });
      }
      doClose();
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Deactivate (soft delete) ──────────────────────────────────────────────

  async function confirmDeactivate() {
    if (!deactivatingId) return;
    setDeactivating(true);
    try {
      const res  = await fetch(`/api/${tenantSlug}/suppliers/${deactivatingId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setToast({ message: json.error ?? "Failed to deactivate supplier", type: "error" });
        return;
      }
      setSuppliers((prev) => prev.map((s) => (s.id === deactivatingId ? json.data : s)));
      setToast({ message: "Supplier deactivated", type: "success" });
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setDeactivating(false);
      setDeactivatingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {suppliers.length} total · {suppliers.filter((s) => s.status === "Active").length} active
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" /> Add Supplier
        </Button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const cnt      = counts[card.key as keyof typeof counts] ?? 0;
          const isActive = categoryFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => setCategoryFilter(card.key)}
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
          <h2 className="text-sm font-bold text-gray-900 flex-1">All Suppliers</h2>

          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search company, contact, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7]"
            />
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/30 focus:border-[#6c5ce7] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Goods">Goods</option>
              <option value="Services">Services</option>
              <option value="Equipment">Equipment</option>
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
                <th className="px-6 py-3.5 text-left font-semibold">Company</th>
                <th className="px-6 py-3.5 text-left font-semibold">Contact Person</th>
                <th className="px-6 py-3.5 text-left font-semibold">Category</th>
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
                        <Truck className="h-6 w-6 text-[#6c5ce7]" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">
                        {search || categoryFilter !== "all" || statusFilter !== "all"
                          ? "No suppliers match your filters"
                          : "No suppliers yet — add your first!"}
                      </p>
                      {!search && categoryFilter === "all" && statusFilter === "all" && (
                        <Button size="sm" onClick={openAdd}>
                          <Plus className="h-3.5 w-3.5" /> Add Supplier
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#faf8ff] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#ede9fe] flex items-center justify-center text-[#6c5ce7] font-bold text-xs flex-shrink-0">
                          {s.companyName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{s.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.contactPerson}</td>
                    <td className="px-6 py-4">
                      <Badge variant={CATEGORY_BADGE[s.category] ?? "gray"}>{s.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.email ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.location ?? "—"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={s.status === "Active" ? "green" : "red"}>{s.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => openEdit(s)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#6c5ce7] hover:underline"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        {s.status === "Active" && (
                          <button
                            onClick={() => setDeactivatingId(s.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <PowerOff className="h-3 w-3" /> Deactivate
                          </button>
                        )}
                      </div>
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
            Showing {filtered.length} of {suppliers.length} suppliers
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
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
                "flex flex-col max-h-[92vh] shadow-2xl relative overflow-hidden",
              )}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Discard confirmation overlay */}
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
                  {editingId ? "Edit Supplier" : "Add New Supplier"}
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

              {/* Form */}
              <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

                  {/* Category tiles */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.map(({ value, label, Icon }) => {
                        const sel = form.category === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => change("category", value)}
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
                    {touched.category && errors.category && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.category}</p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => change("companyName", e.target.value)}
                      onBlur={() => blur("companyName")}
                      placeholder="e.g. Teltonika East Africa"
                      className={inputClass("companyName")}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Each word auto-capitalised · must be unique</p>
                    {touched.companyName && errors.companyName && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.companyName}</p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.contactPerson}
                      onChange={(e) => change("contactPerson", e.target.value)}
                      onBlur={() => blur("contactPerson")}
                      placeholder="e.g. David Ochieng"
                      className={inputClass("contactPerson")}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Each word auto-capitalised</p>
                    {touched.contactPerson && errors.contactPerson && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.contactPerson}</p>
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
                      placeholder="e.g. david@teltonika.com"
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

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Notes{" "}
                      <span className="text-gray-400 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => change("notes", e.target.value)}
                      onBlur={() => blur("notes")}
                      placeholder="Any additional notes about this supplier…"
                      rows={3}
                      className={cn(
                        inputClass("notes"),
                        "resize-none leading-relaxed",
                      )}
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
                      : (editingId ? "Update Supplier" : "Add Supplier")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Deactivate Confirm Dialog ─────────────────────────────────────────── */}
      {deactivatingId && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setDeactivatingId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <PowerOff className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 text-center">Deactivate supplier?</h3>
              <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">
                This supplier will be marked as Inactive and hidden from active filters.
                You can reactivate them by editing their record.
              </p>
              <div className="flex gap-2 mt-5">
                <Button
                  type="button" variant="outline" size="sm" className="flex-1"
                  onClick={() => setDeactivatingId(null)} disabled={deactivating}
                >
                  Cancel
                </Button>
                <Button
                  type="button" variant="danger" size="sm" className="flex-1"
                  onClick={confirmDeactivate} disabled={deactivating}
                >
                  {deactivating ? "Deactivating…" : "Deactivate"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
