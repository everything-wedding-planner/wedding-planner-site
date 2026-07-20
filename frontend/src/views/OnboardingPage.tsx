import { useState } from "react";
import { Package, Building2, Building } from "lucide-react";
import OnboardingStep from "../components/OnboardingStep";
import type { VendorProfile } from "../../../src/models/vendorModel";
import type { VenueProfile } from "../../../src/models/venueModel";
import type { CompanyProfile } from "../../../src/models/companyModel";
import { Link, Navigate } from "react-router-dom";

type Role = "vendor" | "venue";

const emptyCompany: CompanyProfile = {
  name: "",
  address: "",
  phone: "",
  email: "",
};

const emptyVendor: VendorProfile = {
  businessName: "",
  serviceType: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

const emptyVenue: VenueProfile = {
  venueName: "",
  address: "",
  capacity: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile>(emptyCompany);
  const [vendorProfile, setVendorProfile] =
    useState<VendorProfile>(emptyVendor);
  const [venueProfile, setVenueProfile] = useState<VenueProfile>(emptyVenue);

  const hasVendor = roles.includes("vendor");
  const hasVenue = roles.includes("venue");

  const roleOrder: Role[] = [];
  if (hasVendor) roleOrder.push("vendor");
  if (hasVenue) roleOrder.push("venue");

  const profileStepsCount = roleOrder.length;

  const totalSteps = 1 + 1 + profileStepsCount + 1;

  const isInRoleSelection = step === 2;
  const isInCompany = step === 1;

  const currentProfileIndex = (() => {
    if (!hasVendor && !hasVenue) return -1;
    let idx = 0;
    let baseStep = 3;
    if (hasVendor && step === baseStep + idx) return idx;
    if (hasVendor) idx++;
    if (hasVenue && step === baseStep + idx) return idx;
    return -1;
  })();

  const isInProfiles = currentProfileIndex >= 0;
  const isInReview = step === totalSteps && currentProfileIndex === -1;

  const currentStepNumber = (() => {
    if (isInCompany) return 1;
    if (isInRoleSelection) return 2;
    if (isInProfiles) {
      let s = 3;
      for (let i = 0; i < currentProfileIndex; i++) {
        s++;
      }
      return s;
    }
    return totalSteps;
  })();

  const toggleRole = (role: Role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyProfile({ ...companyProfile, [e.target.name]: e.target.value });
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorProfile({ ...vendorProfile, [e.target.name]: e.target.value });
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVenueProfile({ ...venueProfile, [e.target.name]: e.target.value });
  };

  const handleSkip = () => {
    setStep(1);
    setRoles([]);
    setCompanyProfile(emptyCompany);
    setVendorProfile(emptyVendor);
    setVenueProfile(emptyVenue);
  };

  const handleBack = () => {
    if (isInCompany) return;
    if (isInRoleSelection) {
      setStep(1);
    } else if (isInProfiles) {
      if (currentProfileIndex === 0) {
        setStep(2);
      } else {
        setStep(step - 1);
      }
    } else if (isInReview) {
      const lastProfileIdx = profileStepsCount - 1;
      if (lastProfileIdx >= 0) {
        setStep(3 + lastProfileIdx);
      } else {
        setStep(2);
      }
    }
  };

  const handleContinue = () => {
    if (isInCompany) {
      setStep(2);
    } else if (isInRoleSelection) {
      if (hasVendor || hasVenue) {
        setStep(3);
      }
    } else if (isInProfiles) {
      const nextIdx = currentProfileIndex + 1;
      if (nextIdx < roleOrder.length) {
        setStep(step + 1);
      } else {
        setStep(step + 1);
      }
    }
  };

  const companyFilled = Object.values(companyProfile).every(
    (v) => v.trim() !== "",
  );
  const atLeastOneRole = hasVendor || hasVenue;

  const allFieldsFilled = (() => {
    if (hasVendor && hasVenue) {
      return (
        Object.values(vendorProfile).every((v) => v.trim() !== "") &&
        Object.values(venueProfile).every((v) => v.trim() !== "")
      );
    }
    if (hasVendor) {
      return Object.values(vendorProfile).every((v) => v.trim() !== "");
    }
    if (hasVenue) {
      return Object.values(venueProfile).every((v) => v.trim() !== "");
    }
    return false;
  })();

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      let bodyData = {};
      bodyData = { ...bodyData, company: companyProfile };
      if (hasVendor) {
        bodyData = { ...bodyData, vendor: vendorProfile };
      }
      if (hasVenue) {
        bodyData = { ...bodyData, venue: venueProfile };
      }

      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
      if (!response.ok) {
        setIsSubmitting(false);
        throw new Error("Failed to submit onboarding data");
      } else {
        setIsSubmitting(false);
        setStep(totalSteps + 1);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error submitting onboarding data:", error);
    }
  };

  if (step > totalSteps) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
        <div className="w-full max-w-md text-center bg-white rounded-xl shadow-md p-6 sm:p-8">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your profile has been set up successfully.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            You can now explore the platform and start managing your business.
          </p>
          <button>
            <Navigate to="/dashboard" />
          </button>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (isInCompany) return "Tell us about your company";
    if (isInRoleSelection) return "What best describes you?";
    if (isInProfiles) {
      return roleOrder[currentProfileIndex] === "vendor"
        ? "Tell us about your business"
        : "Tell us about your venue";
    }
    return "Review your details";
  };

  const getSubtitle = () => {
    if (isInCompany) return "We'll use this for your business profile.";
    if (isInRoleSelection)
      return "Select all that apply. We'll tailor your experience based on your role.";
    if (isInProfiles) return undefined;
    return "Make sure everything looks right.";
  };

  return (
    <OnboardingStep
      title={getTitle()}
      subtitle={getSubtitle()}
      step={currentStepNumber}
      totalSteps={totalSteps}
      onBack={step > 1 ? handleBack : undefined}
      onSkip={step < totalSteps ? handleSkip : undefined}
    >
      {isInCompany && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company name
            </label>
            <input
              name="name"
              type="text"
              required
              value={companyProfile.name}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="ACME Weddings Ltd."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              type="text"
              required
              value={companyProfile.address}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="123 Business Ave"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              required
              value={companyProfile.phone}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="555-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={companyProfile.email}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="hello@acmeweddings.com"
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!companyFilled}
            className="w-full mt-4 py-2.5 px-4 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {isInRoleSelection && (
        <div className="space-y-3">
          <button
            onClick={() => toggleRole("vendor")}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
              hasVendor
                ? "ring-2 ring-rose-500 bg-rose-50 border-rose-200"
                : "border-gray-200 hover:border-rose-200 hover:bg-gray-50"
            }`}
          >
            <Package
              size={24}
              className={hasVendor ? "text-rose-600" : "text-gray-400"}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Vendor</p>
              <p className="text-sm text-gray-500">
                I offer services for weddings
              </p>
            </div>
            <input
              type="checkbox"
              checked={hasVendor}
              readOnly
              className="h-5 w-5 accent-rose-600 pointer-events-none"
            />
          </button>

          <button
            onClick={() => toggleRole("venue")}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
              hasVenue
                ? "ring-2 ring-rose-500 bg-rose-50 border-rose-200"
                : "border-gray-200 hover:border-rose-200 hover:bg-gray-50"
            }`}
          >
            <Building2
              size={24}
              className={hasVenue ? "text-rose-600" : "text-gray-400"}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Venue</p>
              <p className="text-sm text-gray-500">
                I host weddings at my venue
              </p>
            </div>
            <input
              type="checkbox"
              checked={hasVenue}
              readOnly
              className="h-5 w-5 accent-rose-600 pointer-events-none"
            />
          </button>

          <button
            onClick={handleContinue}
            disabled={!atLeastOneRole}
            className="w-full mt-6 py-2.5 px-4 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {isInProfiles && roleOrder[currentProfileIndex] === "vendor" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business name
            </label>
            <input
              name="businessName"
              type="text"
              required
              value={vendorProfile.businessName}
              onChange={handleVendorChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="Elegant Events Co."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service type
            </label>
            <input
              name="serviceType"
              type="text"
              required
              value={vendorProfile.serviceType}
              onChange={handleVendorChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="Catering, Photography, Florist..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact name
            </label>
            <input
              name="contactName"
              type="text"
              required
              value={vendorProfile.contactName}
              onChange={handleVendorChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact email
            </label>
            <input
              name="contactEmail"
              type="email"
              required
              value={vendorProfile.contactEmail}
              onChange={handleVendorChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              name="contactPhone"
              type="tel"
              value={vendorProfile.contactPhone}
              onChange={handleVendorChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="555-0123"
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={
              !Object.values(vendorProfile).every((v) => v.trim() !== "")
            }
            className="w-full mt-4 py-2.5 px-4 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {isInProfiles && roleOrder[currentProfileIndex] === "venue" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue name
            </label>
            <input
              name="venueName"
              type="text"
              required
              value={venueProfile.venueName}
              onChange={handleVenueChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="The Grand Ballroom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              type="text"
              required
              value={venueProfile.address}
              onChange={handleVenueChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="123 Wedding Lane"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              name="capacity"
              type="number"
              required
              value={venueProfile.capacity}
              onChange={handleVenueChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact name
            </label>
            <input
              name="contactName"
              type="text"
              required
              value={venueProfile.contactName}
              onChange={handleVenueChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact email
            </label>
            <input
              name="contactEmail"
              type="email"
              required
              value={venueProfile.contactEmail}
              onChange={handleVenueChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              name="contactPhone"
              type="tel"
              value={venueProfile.contactPhone}
              onChange={handleVenueChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              placeholder="555-0123"
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={
              !Object.values(venueProfile).every((v) => v.trim() !== "")
            }
            className="w-full mt-4 py-2.5 px-4 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {isInReview && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building size={18} className="text-rose-600" />
              <h3 className="font-medium text-gray-900">Company Details</h3>
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-gray-900">{companyProfile.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Address</dt>
                <dd className="text-gray-900">{companyProfile.address}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{companyProfile.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{companyProfile.email}</dd>
              </div>
            </dl>
          </div>

          {hasVendor && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} className="text-rose-600" />
                <h3 className="font-medium text-gray-900">Vendor Details</h3>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Business</dt>
                  <dd className="text-gray-900">
                    {vendorProfile.businessName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Service</dt>
                  <dd className="text-gray-900">{vendorProfile.serviceType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Contact</dt>
                  <dd className="text-gray-900">{vendorProfile.contactName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900">
                    {vendorProfile.contactEmail}
                  </dd>
                </div>
                {vendorProfile.contactPhone && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="text-gray-900">
                      {vendorProfile.contactPhone}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {hasVenue && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={18} className="text-rose-600" />
                <h3 className="font-medium text-gray-900">Venue Details</h3>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Venue</dt>
                  <dd className="text-gray-900">{venueProfile.venueName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Address</dt>
                  <dd className="text-gray-900">{venueProfile.address}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Capacity</dt>
                  <dd className="text-gray-900">{venueProfile.capacity}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Contact</dt>
                  <dd className="text-gray-900">{venueProfile.contactName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900">{venueProfile.contactEmail}</dd>
                </div>
                {venueProfile.contactPhone && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="text-gray-900">
                      {venueProfile.contactPhone}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {isSubmitting ? (
            <div className="w-full py-2.5 px-4 text-sm font-medium text-white bg-rose-600 rounded-md flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </div>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!allFieldsFilled}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Finish
            </button>
          )}

          <button
            onClick={handleSkip}
            className="w-full py-2.5 px-4 text-sm font-medium text-rose-600 border border-rose-200 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
          >
            Skip to Dashboard
          </button>
        </div>
      )}
    </OnboardingStep>
  );
}
