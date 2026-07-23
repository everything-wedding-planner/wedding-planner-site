import React, { createContext, useContext, useState, useEffect } from "react";
import type { CompanyResponseDTO } from "../../../src/DTO/companyDTO";
import type { VendorResponseDTO } from "../../../src/DTO/vendorDTO";
import type { VenueResponseDTO } from "../../../src/DTO/venueDTO";

interface DashboardDataContextType {
  company: CompanyResponseDTO | null;
  vendors: VendorResponseDTO[] | null;
  venues: VenueResponseDTO[] | null;
  isLoading: boolean;
  refetch: () => void;
}

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);

export const DashboardDataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [company, setCompany] = useState<CompanyResponseDTO | null>(null);
  const [vendors, setVendors] = useState<VendorResponseDTO[] | null>(null);
  const [venues, setVenues] = useState<VenueResponseDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    setIsLoading(true);
    fetch("/api/dashboard", { credentials: "include" })
      .then((res) => {
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
        setVendors(null);
        setVenues(null);
        console.error("Error fetching dashboard data:", error);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardDataContext value={{ company, vendors, venues, isLoading, refetch: fetchData }}>
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
