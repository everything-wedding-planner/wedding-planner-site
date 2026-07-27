import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Calendar } from "lucide-react";
import Card from "../components/Card";
import StatsCard from "../components/StatsCard";
import Badge from "../components/Badge";
import StatusSelect from "../components/StatusSelect";
import BookingCalendar from "../components/BookingCalendar";
import type { Inquiry, Booking } from "../types";

interface VendorDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  service_type: string;
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInquiry, setExpandedInquiry] = useState<number | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vendorRes, inquiriesRes, bookingsRes] = await Promise.all([
        fetch(`/api/vendors/${id}`, { credentials: "include" }),
        fetch(`/api/vendors/${id}/inquiries`, { credentials: "include" }),
        fetch(`/api/vendors/${id}/bookings`, { credentials: "include" }),
      ]);

      if (!vendorRes.ok) throw new Error("Failed to fetch vendor");
      const vendorData = await vendorRes.json();
      setVendor(vendorData);

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        setInquiries(inquiriesData.inquiries ?? []);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings ?? []);
      }
    } catch {
      setError("Failed to load vendor details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInquiryStatusChange = async (
    inquiryId: number,
    newStatus: string,
  ) => {
    const previous = inquiries;
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === inquiryId
          ? { ...i, status: newStatus as Inquiry["status"] }
          : i,
      ),
    );

    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      setInquiries(previous);
    }
  };

  const handleBookingStatusChange = async (
    bookingId: number,
    newStatus: string,
  ) => {
    const previous = bookings;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: newStatus as Booking["status"] }
          : b,
      ),
    );

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      setBookings(previous);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-rose-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="space-y-4">
        <Link
          to="/vendors"
          className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft size={16} /> Back to Vendors
        </Link>
        <p className="text-red-600 text-sm">{error ?? "Vendor not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/vendors"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft size={16} /> Back to Vendors
      </Link>

      {/* Header card */}
      <Card>
        <h1 className="text-2xl font-bold text-stone-900">{vendor.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600">
          {vendor.email && <span>{vendor.email}</span>}
          {vendor.phone && <span>{vendor.phone}</span>}
          {vendor.service_type && <span>{vendor.service_type}</span>}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          label="Inquiries"
          value={inquiries.length}
          icon={MessageSquare}
        />
        <StatsCard
          label="Bookings"
          value={bookings.length}
          icon={Calendar}
        />
      </div>

      {/* Inquiries section */}
      <Card title="Inquiries">
        {inquiries.length === 0 ? (
          <p className="text-sm text-stone-500 py-4 text-center">
            No inquiries yet.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Event Date
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <InquiryRow
                    key={inquiry.id}
                    inquiry={inquiry}
                    isExpanded={expandedInquiry === inquiry.id}
                    onToggle={() =>
                      setExpandedInquiry(
                        expandedInquiry === inquiry.id ? null : inquiry.id,
                      )
                    }
                    onStatusChange={handleInquiryStatusChange}
                  />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {inquiries.map((inquiry) => (
                <InquiryCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  isExpanded={expandedInquiry === inquiry.id}
                  onToggle={() =>
                    setExpandedInquiry(
                      expandedInquiry === inquiry.id ? null : inquiry.id,
                    )
                  }
                  onStatusChange={handleInquiryStatusChange}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Bookings section */}
      <Card title="Bookings">
        {bookings.length === 0 ? (
          <p className="text-sm text-stone-500 py-4 text-center">
            No bookings yet.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Event Date
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    isExpanded={expandedBooking === booking.id}
                    onToggle={() =>
                      setExpandedBooking(
                        expandedBooking === booking.id ? null : booking.id,
                      )
                    }
                    onStatusChange={handleBookingStatusChange}
                  />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isExpanded={expandedBooking === booking.id}
                  onToggle={() =>
                    setExpandedBooking(
                      expandedBooking === booking.id ? null : booking.id,
                    )
                  }
                  onStatusChange={handleBookingStatusChange}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Calendar */}
      <BookingCalendar bookings={bookings} />
    </div>
  );
}

/* ---------- Inquiry sub-components ---------- */

function InquiryRow({
  inquiry,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  inquiry: Inquiry;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <>
      <tr
        className="hover:bg-stone-50 border-b border-stone-100 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-sm text-stone-900">
          {new Date(inquiry.event_date).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <Badge variant={inquiry.status}>{inquiry.status}</Badge>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {inquiry.status !== "CANCELLED" && inquiry.status !== "REJECTED" && (
            <StatusSelect
              currentStatus={inquiry.status}
              type="inquiry"
              onStatusChange={(s) => onStatusChange(inquiry.id, s)}
            />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={3} className="bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <div className="grid grid-cols-2 gap-2">
              <span>Client ID: {inquiry.client_id}</span>
              <span>Service Type: {inquiry.service_type}</span>
              <span>Created: {new Date(inquiry.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(inquiry.updated_at).toLocaleString()}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function InquiryCard({
  inquiry,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  inquiry: Inquiry;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="bg-white border border-stone-100 rounded-lg p-4">
      <div className="flex items-center justify-between" onClick={onToggle}>
        <p className="text-sm font-medium text-stone-900">
          {new Date(inquiry.event_date).toLocaleDateString()}
        </p>
        <Badge variant={inquiry.status}>{inquiry.status}</Badge>
      </div>
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        {inquiry.status !== "CANCELLED" && inquiry.status !== "REJECTED" && (
          <StatusSelect
            currentStatus={inquiry.status}
            type="inquiry"
            onStatusChange={(s) => onStatusChange(inquiry.id, s)}
          />
        )}
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 text-sm text-stone-600 space-y-1">
          <p>Client ID: {inquiry.client_id}</p>
          <p>Service Type: {inquiry.service_type}</p>
          <p>Created: {new Date(inquiry.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(inquiry.updated_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Booking sub-components ---------- */

function BookingRow({
  booking,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  booking: Booking;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <>
      <tr
        className="hover:bg-stone-50 border-b border-stone-100 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-sm text-stone-900">
          {new Date(booking.event_date).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <Badge variant={booking.status}>{booking.status}</Badge>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          {booking.status !== "CANCELLED" && booking.status !== "REJECTED" && (
            <StatusSelect
              currentStatus={booking.status}
              type="booking"
              onStatusChange={(s) => onStatusChange(booking.id, s)}
            />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={3} className="bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <div className="grid grid-cols-2 gap-2">
              <span>Client ID: {booking.client_id}</span>
              <span>Service Type: {booking.service_type}</span>
              <span>Created: {new Date(booking.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(booking.updated_at).toLocaleString()}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function BookingCard({
  booking,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  booking: Booking;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  return (
    <div className="bg-white border border-stone-100 rounded-lg p-4">
      <div className="flex items-center justify-between" onClick={onToggle}>
        <p className="text-sm font-medium text-stone-900">
          {new Date(booking.event_date).toLocaleDateString()}
        </p>
        <Badge variant={booking.status}>{booking.status}</Badge>
      </div>
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        {booking.status !== "CANCELLED" && booking.status !== "REJECTED" && (
          <StatusSelect
            currentStatus={booking.status}
            type="booking"
            onStatusChange={(s) => onStatusChange(booking.id, s)}
          />
        )}
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 text-sm text-stone-600 space-y-1">
          <p>Client ID: {booking.client_id}</p>
          <p>Service Type: {booking.service_type}</p>
          <p>Created: {new Date(booking.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(booking.updated_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
