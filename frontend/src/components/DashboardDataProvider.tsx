import React, { createContext, useContext, useState, useEffect } from "react";
import type { CompanyRow } from "../../../src/models/companyModel";
import type { VendorRow } from "../../../src/models/vendorModel";
import type { VenueRow } from "../../../src/models/venueModel";

interface DashboardDataContextType {
  company: CompanyRow | null;
  vendor: VendorRow | null;
  venues: VenueRow[] | null;
  isLoading: boolean;
}

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);

export const DashboardDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [venues, setVenues] = useState<VenueRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setCompany(data.data.company);
        setVendor(data.data.vendor);
        setVenues(data.data.venues);
      })
      .catch((error) => {
        setCompany(null);
        setVendor(null);
        setVenues(null);
        console.error("Error fetching dashboard data:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardDataContext value={{ company, vendor, venues, isLoading }}>
      {children}
    </DashboardDataContext>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context)
    throw new Error(
      "useDashboardData must be used within a DashboardDataProvider",
    );
  return context;
};
