import { useAuth } from "../AuthProvider";
import { useEffect, useState } from "react";
import type { CompanyRow } from "../../../src/models/companyModel";
import type { VendorRow } from "../../../src/models/vendorModel";
import type { VenueRow } from "../../../src/models/venueModel";

export default function DashboardHome() {
  const { user } = useAuth();

  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [venues, setVenues] = useState<VenueRow[]>([]);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((res) => {
        console.log(res);
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setCompany(data.data.company);
        setVendors(data.data.vendors);
        setVenues(data.data.venues);
      })
      .catch((error) => {
        setCompany(null);
        setVendors([]);
        setVenues([]);
        console.error("Error fetching dashboard data:", error);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">
        Welcome back, {user?.username || "User"}!
      </h1>
      <p className="mt-2 text-stone-500">Let's plan your perfect day</p>
    </div>
  );
}
