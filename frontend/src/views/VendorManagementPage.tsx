import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import Card from "../components/Card";

interface VendorWithMetrics {
  id: number;
  company: string;
  name: string;
  service_type: string;
  contact_name: string;
  email: string;
  phone: string;
  inquiry_count: number;
  booking_count: number;
  created_at: Date;
  updated_at: Date;
}

interface VendorFormData {
  name: string;
  service_type: string;
  contact_name: string;
  email: string;
  phone: string;
}

const emptyForm: VendorFormData = {
  name: "",
  service_type: "",
  contact_name: "",
  email: "",
  phone: "",
};

function validateForm(form: VendorFormData): string | null {
  if (!form.name || form.name.trim().length < 2)
    return "Name must be at least 2 characters";
  if (!form.service_type || form.service_type.trim().length === 0)
    return "Service type is required";
  if (!form.contact_name || form.contact_name.trim().length === 0)
    return "Contact name is required";
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return "Valid email is required";
  if (!form.phone || form.phone.trim().length === 0) return "Phone is required";
  return null;
}

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<VendorWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VendorFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<VendorFormData>(emptyForm);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vendors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      setVendors(data.vendors ?? []);
    } catch {
      setError("Failed to load vendors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (vendor: VendorWithMetrics) => {
    setEditingId(vendor.id);
    setEditForm({
      name: vendor.name,
      service_type: vendor.service_type,
      contact_name: vendor.contact_name,
      email: vendor.email,
      phone: vendor.phone,
    });
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleSave = async (id: number) => {
    const validationError = validateForm(editForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update vendor");
      setEditingId(null);
      setEditForm(emptyForm);
      await fetchVendors();
      showSuccess("Vendor updated successfully");
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setAddForm(emptyForm);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setAddForm(emptyForm);
  };

  const handleSaveAdd = async () => {
    const validationError = validateForm(addForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error("Failed to create vendor");
      setIsAdding(false);
      setAddForm(emptyForm);
      await fetchVendors();
      showSuccess("Vendor created successfully");
    } catch {
      setError("Failed to create vendor. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500";

  const renderFormRow = (
    form: VendorFormData,
    setForm: React.Dispatch<React.SetStateAction<VendorFormData>>,
    onSave: () => void,
    onCancel: () => void,
  ) => (
    <tr className="bg-stone-50 border-b border-stone-100">
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Vendor name"
          className={inputClass}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.service_type}
          onChange={(e) => setForm({ ...form, service_type: e.target.value })}
          placeholder="Service type"
          className={inputClass}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.contact_name}
          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          placeholder="Contact name"
          className={inputClass}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className={inputClass}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className={inputClass}
        />
      </td>
      <td className="px-4 py-3" />
      <td className="px-4 py-3" />
      <td className="px-4 py-3">
        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
          Vendors
        </h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {successMessage && (
        <p className="text-green-600 text-sm">{successMessage}</p>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900">
            Vendor Management
          </h2>
          {!isAdding && !editingId && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
            >
              <Plus size={16} />
              Add Vendor
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-rose-600" size={24} />
          </div>
        ) : vendors.length === 0 && !isAdding ? (
          <p className="text-sm text-stone-500 py-4 text-center">
            No vendors associated with this company.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Service Type
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Contact
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Phone
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Inquiries
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Bookings
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isAdding &&
                  renderFormRow(
                    addForm,
                    setAddForm,
                    handleSaveAdd,
                    handleCancelAdd,
                  )}
                {vendors.map((vendor) =>
                  editingId === vendor.id ? (
                    renderFormRow(
                      editForm,
                      setEditForm,
                      () => handleSave(vendor.id),
                      handleCancelEdit,
                    )
                  ) : (
                    <tr
                      key={vendor.id}
                      className="hover:bg-stone-50 border-b border-stone-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-stone-900">
                        {vendor.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {vendor.service_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {vendor.contact_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {vendor.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {vendor.phone}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          {vendor.inquiry_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {vendor.booking_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="text-sm font-medium text-rose-600 hover:text-rose-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {/* Mobile card layout */}
            <div className="sm:hidden space-y-3">
              {isAdding && (
                <div className="bg-white border border-stone-100 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-stone-900">
                    New Vendor
                  </p>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    placeholder="Vendor name"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={addForm.service_type}
                    onChange={(e) =>
                      setAddForm({ ...addForm, service_type: e.target.value })
                    }
                    placeholder="Service type"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={addForm.contact_name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, contact_name: e.target.value })
                    }
                    placeholder="Contact name"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    placeholder="Email"
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    placeholder="Phone"
                    className={inputClass}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveAdd}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {vendors.map((vendor) =>
                editingId === vendor.id ? (
                  <div
                    key={vendor.id}
                    className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3"
                  >
                    <p className="text-sm font-medium text-stone-900">
                      Editing: {vendor.name}
                    </p>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Vendor name"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editForm.service_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          service_type: e.target.value,
                        })
                      }
                      placeholder="Service type"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={editForm.contact_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contact_name: e.target.value,
                        })
                      }
                      placeholder="Contact name"
                      className={inputClass}
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="Email"
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="Phone"
                      className={inputClass}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(vendor.id)}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={vendor.id}
                    className="bg-white border border-stone-100 rounded-lg p-4"
                  >
                    <p className="text-sm font-medium text-stone-900">
                      {vendor.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      {vendor.service_type}
                    </p>
                    <p className="text-sm text-stone-500">
                      {vendor.contact_name}
                    </p>
                    <p className="text-sm text-stone-500">{vendor.email}</p>
                    <p className="text-sm text-stone-500">{vendor.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        {vendor.inquiry_count} inquiries
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {vendor.booking_count} bookings
                      </span>
                    </div>
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Edit
                    </button>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
