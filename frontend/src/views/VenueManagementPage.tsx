import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, ImageIcon } from "lucide-react";
import Card from "../components/Card";
import { useDashboardData } from "../components/DashboardDataProvider";

interface VenueWithMetrics {
  id: number;
  company: string;
  name: string;
  address: string;
  capacity: number;
  contact_name: string;
  email: string;
  phone: string;
  inquiry_count: number;
  booking_count: number;
  created_at: Date;
  updated_at: Date;
  thumbnail_url?: string;
}

interface VenueFormData {
  name: string;
  address: string;
  capacity: number;
  contact_name: string;
  email: string;
  phone: string;
}

const emptyForm: VenueFormData = {
  name: "",
  address: "",
  capacity: 1,
  contact_name: "",
  email: "",
  phone: "",
};

function validateForm(form: VenueFormData): string | null {
  if (!form.name || form.name.trim().length < 2)
    return "Name must be at least 2 characters";
  if (!form.address || form.address.trim().length === 0)
    return "Address is required";
  if (!form.capacity || form.capacity < 1) return "Capacity must be at least 1";
  if (!form.contact_name || form.contact_name.trim().length === 0)
    return "Contact name is required";
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return "Valid email is required";
  if (!form.phone || form.phone.trim().length === 0) return "Phone is required";
  return null;
}

export default function VenueManagementPage() {
  const { refetch } = useDashboardData();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VenueWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VenueFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<VenueFormData>(emptyForm);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/venues", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch venues");
      const data = await res.json();
      setVenues(data.venues ?? []);
    } catch {
      setError("Failed to load venues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (venue: VenueWithMetrics) => {
    setEditingId(venue.id);
    setEditForm({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
      contact_name: venue.contact_name,
      email: venue.email,
      phone: venue.phone,
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
      const res = await fetch(`/api/venues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update venue");
      setEditingId(null);
      setEditForm(emptyForm);
      await fetchVenues();
      refetch();
      showSuccess("Venue updated successfully");
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
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error("Failed to create venue");
      setIsAdding(false);
      setAddForm(emptyForm);
      await fetchVenues();
      refetch();
      showSuccess("Venue created successfully");
    } catch {
      setError("Failed to create venue. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderFormRow = (
    form: VenueFormData,
    setForm: React.Dispatch<React.SetStateAction<VenueFormData>>,
    onSave: () => void,
    onCancel: () => void,
  ) => (
    <tr className="bg-stone-50 border-b border-stone-100">
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Venue name"
          className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address"
          className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: Number(e.target.value) })
          }
          min={1}
          className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={form.contact_name}
          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          placeholder="Contact name"
          className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
        />
      </td>
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

  const columns = [
    // {
    //   key: "thumbnail",
    //   header: "Photo",
    //   render: (item: VenueWithMetrics) => (
    //     item.thumbnail_url ? (
    //       <img
    //         src={item.thumbnail_url}
    //         alt=""
    //         className="w-12 h-12 rounded-md object-cover"
    //       />
    //     ) : (
    //       <div className="w-12 h-12 rounded-md bg-stone-100 flex items-center justify-center">
    //         <ImageIcon className="text-gray-300" size={20} />
    //       </div>
    //     )
    //   ),
    // },
    {
      key: "name",
      header: "Name",
      render: (item: VenueWithMetrics) => (
        <span className="font-medium text-stone-900">{item.name}</span>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (item: VenueWithMetrics) => (
        <span className="text-stone-600">{item.address}</span>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (item: VenueWithMetrics) => (
        <span className="text-stone-600">{item.capacity}</span>
      ),
    },
    {
      key: "contact_name",
      header: "Contact",
      render: (item: VenueWithMetrics) => (
        <span className="text-stone-600">{item.contact_name}</span>
      ),
    },
    {
      key: "inquiry_count",
      header: editingId ? "Email" : "Inquiries",
      render: (item: VenueWithMetrics) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
          {item.inquiry_count}
        </span>
      ),
    },
    {
      key: "booking_count",
      header: editingId ? "Phone" : "Bookings",
      render: (item: VenueWithMetrics) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {item.booking_count}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: VenueWithMetrics) => {
        if (editingId === item.id) return null;
        return (
          <button
            onClick={() => handleEdit(item)}
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            Edit
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Venues</h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {successMessage && (
        <p className="text-green-600 text-sm">{successMessage}</p>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900">
            Venue Management
          </h2>
          {!isAdding && !editingId && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
            >
              <Plus size={16} />
              Add Venue
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-rose-600" size={24} />
          </div>
        ) : venues.length === 0 && !isAdding ? (
          <p className="text-sm text-stone-500 py-4 text-center">
            No venues associated with this company.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3 ${col.key === "thumbnail" ? "w-16" : ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
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
                {venues.map((venue) =>
                  editingId === venue.id ? (
                    renderFormRow(
                      editForm,
                      setEditForm,
                      () => handleSave(venue.id),
                      handleCancelEdit,
                    )
                  ) : (
                    <tr
                      key={venue.id}
                      className="hover:bg-stone-50 border-b border-stone-100 last:border-0"
                    >
                      {/* <td className="px-4 py-3">
                        {venue.thumbnail_url ? (
                          <img
                            src={venue.thumbnail_url}
                            alt=""
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-stone-100 flex items-center justify-center">
                            <ImageIcon className="text-gray-300" size={20} />
                          </div>
                        )}
                      </td> */}
                      <td className="px-4 py-3 text-sm font-medium text-stone-900">
                        <button
                          onClick={() => navigate(`/venues/${venue.id}`)}
                          className="text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          {venue.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {venue.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {venue.capacity}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {venue.contact_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          {venue.inquiry_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {venue.booking_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(venue)}
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
                    New Venue
                  </p>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                    placeholder="Venue name"
                    className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    placeholder="Address"
                    className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="number"
                    value={addForm.capacity}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        capacity: Number(e.target.value),
                      })
                    }
                    min={1}
                    placeholder="Capacity"
                    className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    value={addForm.contact_name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, contact_name: e.target.value })
                    }
                    placeholder="Contact name"
                    className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  {/* <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    placeholder="Phone"
                    className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                  /> */}
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
              {venues.map((venue) =>
                editingId === venue.id ? (
                  <div
                    key={venue.id}
                    className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3"
                  >
                    <p className="text-sm font-medium text-stone-900">
                      Editing: {venue.name}
                    </p>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Venue name"
                      className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      placeholder="Address"
                      className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="number"
                      value={editForm.capacity}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          capacity: Number(e.target.value),
                        })
                      }
                      min={1}
                      className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
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
                      className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="Phone"
                      className="w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(venue.id)}
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
                    key={venue.id}
                    className="bg-white border border-stone-100 rounded-lg overflow-hidden"
                  >
                    {/* {venue.thumbnail_url ? (
                      <img
                        src={venue.thumbnail_url}
                        alt=""
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-stone-100 flex items-center justify-center rounded-t-lg">
                        <ImageIcon className="text-gray-300" size={32} />
                      </div>
                    )} */}
                    <div className="p-4">
                      <button
                        onClick={() => navigate(`/venues/${venue.id}`)}
                        className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        {venue.name}
                      </button>
                      <p className="text-sm text-stone-500">{venue.address}</p>
                      <p className="text-sm text-stone-500">
                        Capacity: {venue.capacity}
                      </p>
                      <p className="text-sm text-stone-500">
                        {venue.contact_name}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          {venue.inquiry_count} inquiries
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {venue.booking_count} bookings
                        </span>
                      </div>
                      <button
                        onClick={() => handleEdit(venue)}
                        className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                      >
                        Edit
                      </button>
                    </div>
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
