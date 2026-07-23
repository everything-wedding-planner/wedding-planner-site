import { useState } from "react";
import { Package, Building2 } from "lucide-react";
import Card from "../components/Card";
import DataTable from "../components/DataTable";
import StatsCard from "../components/StatsCard";
import { useDashboardData } from "../components/DashboardDataProvider";
import type { VendorResponseDTO } from "../../../src/DTO/vendorDTO";
import type { VenueResponseDTO } from "../../../src/DTO/venueDTO";

export default function CompanyPage() {
  const { company, vendors, venues, refetch } = useDashboardData();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleEdit = () => {
    if (company) {
      setEditForm({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const vendorColumns = [
    {
      key: "name",
      header: "Name",
      render: (item: VendorResponseDTO) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    { key: "service_type", header: "Service" },
    { key: "contact_name", header: "Contact" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
  ];

  const venueColumns = [
    {
      key: "name",
      header: "Name",
      render: (item: VenueResponseDTO) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    { key: "address", header: "Address" },
    { key: "capacity", header: "Capacity" },
    { key: "contact_name", header: "Contact" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
          Company
        </h1>
      </div>

      <Card>
        <div className="flex items-start justify-between mb-4">
          {isEditing ? (
            <h2 className="text-lg font-semibold text-stone-900">
              Edit Company Info
            </h2>
          ) : (
            <h2 className="text-lg font-semibold text-stone-900">
              {company?.name ?? "Company"}
            </h2>
          )}
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-stone-500">Email</dt>
              <dd className="text-sm text-stone-900">
                {company?.email || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-stone-500">Phone</dt>
              <dd className="text-sm text-stone-900">
                {company?.phone || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-stone-500">Address</dt>
              <dd className="text-sm text-stone-900">
                {company?.address || "—"}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          label="Vendors"
          value={vendors?.length ?? 0}
          icon={Package}
        />
        <StatsCard
          label="Venues"
          value={venues?.length ?? 0}
          icon={Building2}
        />
      </div>

      <Card title="Vendors">
        <DataTable
          columns={vendorColumns}
          data={(vendors ?? []) as (VendorResponseDTO & Record<string, unknown>)[]}
          emptyMessage="No vendors associated with this company."
        />
      </Card>

      <Card title="Venues">
        <DataTable
          columns={venueColumns}
          data={(venues ?? []) as (VenueResponseDTO & Record<string, unknown>)[]}
          emptyMessage="No venues associated with this company."
        />
      </Card>
    </div>
  );
}
