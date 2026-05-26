"use client";

import { useState } from "react";
import { Save, Building2, Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: "Demo Store",
    email: "info@demostore.co.ke",
    phone: "+254 700 000 000",
    address: "Westlands, Nairobi, Kenya",
    website: "https://demostore.co.ke",
    kra: "P051234567M",
    currency: "KES",
    timezone: "Africa/Nairobi",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your business profile and system preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Business Information</h2>
            </div>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Business Name</label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</span>
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Website</span>
              </label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">KRA PIN</label>
              <input
                name="kra"
                value={form.kra}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">System Preferences</h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Timezone</label>
              <select
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Africa/Nairobi">Africa/Nairobi (EAT UTC+3)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Changes saved successfully.</span>
          )}
        </div>
      </form>
    </div>
  );
}
