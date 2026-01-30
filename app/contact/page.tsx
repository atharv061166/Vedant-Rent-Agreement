"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  User, MapPin, Building2, FileText, Calendar, 
  IndianRupee, Briefcase, Home, CheckCircle2, Contact, 
  CreditCard, Users, Check, ArrowLeft, UserCheck, Hash, Phone, Plus 
} from "lucide-react";

// --- TYPES ---

// Individual Client Data Structure
interface ClientData {
  surname: string;
  firstName: string;
  middleName: string;
  clientAge: string;
  panCard: string;
  cinNo: string;
  gender: string;
  clientPhone: string;
  aadharBuilding: string;
  aadharFlat: string;
  aadharRoad: string;
  aadharLocation: string;
  aadharPincode: string;
  aadharVillage: string;
  aadharState: string;
  aadharDistrict: string;
}

interface FormData {
  clientType: string;
  partyType: string;
  partyEntityType: string;
  executing: string;
  clientCount: number; // New field for dropdown

  // --- ARRAY OF CLIENTS ---
  clients: ClientData[];

  // --- POA HOLDER (Authorized Person) ---
  // Keeping POA as a single object for now as usually there is one auth signatory per agreement
  poaSurname: string;
  poaFirstName: string;
  poaMiddleName: string;
  poaClientAge: string;
  poaPanCard: string;
  poaCinNo: string;
  poaGender: string;
  poaClientPhone: string;
  poaAadharBuilding: string;
  poaAadharFlat: string;
  poaAadharRoad: string;
  poaAadharLocation: string;
  poaAadharPincode: string;
  poaAadharVillage: string;
  poaAadharState: string;
  poaAadharDistrict: string;

  // --- PROPERTY & AGREEMENT ---
  address: string;
  unitType: string;
  residentialStatus: string;
  buildingName: string;
  flatNumber: string;
  road: string;
  village: string;
  pincode: string;
  agreementMonths: string;
  fromDate: string;
  deposit: string;
  rent: string;
  varyingMonth: string; 
  varyingRent: string;  
}

const INITIAL_CLIENT: ClientData = {
  surname: "", firstName: "", middleName: "", clientAge: "", panCard: "", cinNo: "", gender: "", clientPhone: "",
  aadharBuilding: "", aadharFlat: "", aadharRoad: "", aadharLocation: "", aadharPincode: "", aadharVillage: "",
  aadharState: "", aadharDistrict: "",
};

export default function ContactPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    clientType: "Owner",
    partyType: "",
    partyEntityType: "",
    executing: "Self",
    clientCount: 1,
    
    // Initialize with one empty client
    clients: [{ ...INITIAL_CLIENT }],

    // POA
    poaSurname: "", poaFirstName: "", poaMiddleName: "", poaClientAge: "", poaPanCard: "", poaCinNo: "", poaGender: "", poaClientPhone: "",
    poaAadharBuilding: "", poaAadharFlat: "", poaAadharRoad: "", poaAadharLocation: "", poaAadharPincode: "", poaAadharVillage: "",
    poaAadharState: "", poaAadharDistrict: "",

    // Property & Agreement
    address: "", unitType: "", residentialStatus: "Residential", buildingName: "", flatNumber: "", road: "", village: "", pincode: "",
    agreementMonths: "", fromDate: "", deposit: "", rent: "", varyingMonth: "", varyingRent: "",
  });

  // --- LOGIC 1: FORCE "THROUGH POA" FOR NON-INDIVIDUAL TENANTS ---
  useEffect(() => {
    if (
      formData.clientType === "Tenant" && 
      formData.partyEntityType !== "" && 
      formData.partyEntityType !== "Individual / Self"
    ) {
      setFormData(prev => ({ ...prev, executing: "Through POA" }));
    }
  }, [formData.clientType, formData.partyEntityType]);

  // --- LOGIC: HANDLE CLIENT COUNT CHANGE ---
  const handleClientCountChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    const currentClients = [...formData.clients];
    
    if (count > currentClients.length) {
      // Add new clients
      const toAdd = count - currentClients.length;
      for (let i = 0; i < toAdd; i++) {
        currentClients.push({ ...INITIAL_CLIENT });
      }
    } else {
      // Remove clients (trim from end)
      currentClients.length = count;
    }

    setFormData(prev => ({ ...prev, clientCount: count, clients: currentClients }));
  };

  // --- HELPER: ENTITY CONFIG ---
  const getEntityConfig = (entityType: string) => {
    const defaults = {
      headerTitle: "Client / Original Owner",
      surnameLabel: "Surname",
      showPersonalStats: true, 
      showNames: true, 
      showCin: false,
      addressHeader: "Aadhar Address",
      showStateDistrict: false
    };

    switch (entityType) {
      case "Proprietorship":
        return { ...defaults, headerTitle: "Proprietorship", surnameLabel: "Firm Name", showPersonalStats: false, showNames: false, addressHeader: "Address as per GSTIN No", showStateDistrict: true };
      case "Partnership":
        return { ...defaults, headerTitle: "Partnership", surnameLabel: "Firm Name", showPersonalStats: false, showNames: false, addressHeader: "Address as per GSTIN No", showStateDistrict: true };
      case "Private Limited Company":
        return { ...defaults, headerTitle: "Private Limited Company", surnameLabel: "Name of Company", showPersonalStats: false, showNames: false, showCin: true, addressHeader: "Address as per GST Address", showStateDistrict: true };
      case "Central Government Undertaking":
      case "Central Government Department": 
        return { ...defaults, headerTitle: "Central Government Undertaking", surnameLabel: "Name", showPersonalStats: false, showNames: false, addressHeader: "Branch Address", showStateDistrict: true };
      case "Limited Liability Partnership":
        return { ...defaults, headerTitle: "Limited Liability Partnership", surnameLabel: "Company Name", showPersonalStats: false, showNames: false, addressHeader: "Address as per Company/GST", showStateDistrict: true };
      case "Individual / Self":
      default:
        return defaults;
    }
  };

  // --- HANDLERS ---
  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for a specific client in the array
  const handleClientChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedClients = [...formData.clients];
    // Remove the prefix (e.g., "client0_surname" -> "surname") if manual handling needed, 
    // but here we will pass direct field names to the renderer.
    // However, the renderer usually uses a prefix. Let's adapt the renderer or the handler.
    // BETTER APPROACH: The renderer sends the CLEAN field name, we update the object at `index`.
    
    // We need to strip the prefix used in renderPersonalDetails to match the ClientData key
    // The prefix logic in renderPersonalDetails: `${prefix}${FieldName}`
    // Since we are inside a loop, we likely didn't pass a string prefix to the name attribute in the Input, 
    // or we need to parse it. 
    
    // SIMPLER: Let's make the Input `name` attribute be just the field key (e.g., "surname"), 
    // and rely on the closure `index` to update the right object.
    
    updatedClients[index] = { ...updatedClients[index], [name]: value };
    setFormData(prev => ({ ...prev, clients: updatedClients }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Simplified validation for demo - ensure logic handles array validation if needed
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit form");
      alert("Form submitted successfully!");
    } catch (err: any) {
      alert(err?.message || "Something went wrong. Please try again.");
    }
  };

  // --- FIXED STYLES ---
  const inputClass = "w-full px-4 py-3 bg-white/80 border-2 border-gray-300 text-gray-900 font-medium text-sm rounded-xl focus:border-orange-500 focus:outline-none block transition-colors shadow-sm placeholder:text-gray-500";
  const iconInputWrapperClass = "relative flex items-center w-full bg-white/80 border-2 border-gray-300 rounded-xl shadow-sm transition-colors focus-within:border-orange-500 overflow-hidden";
  const transparentInputClass = "w-full py-3 px-4 bg-transparent border-none text-gray-900 font-medium text-sm focus:ring-0 focus:outline-none placeholder:text-gray-500 h-full";
  const labelClass = "block mb-2 text-xs font-extrabold text-gray-600 uppercase tracking-widest ml-1";

  // --- RENDERER ---
  // isPOA: boolean to toggle between array update vs root level update
  // clientIndex: index in the clients array (ignored if isPOA is true)
  const renderPersonalDetails = (isPOA: boolean, clientIndex: number = 0, customConfig?: any) => {
    const config = customConfig || getEntityConfig("Individual / Self");
    
    // Determine where to get/set value
    const getValue = (field: string) => {
      if (isPOA) {
        // POA fields use prefix "poa" + CapitalizedField in root state
        const key = `poa${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof FormData;
        return formData[key] as string;
      } else {
        // Client array fields
        return (formData.clients[clientIndex] as any)[field];
      }
    };

    const handleChangeWrapper = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (isPOA) {
        handleGeneralChange(e);
      } else {
        // For array, we pass the raw field name (e.g. "surname")
        // We need to ensure the Input `name` matches the key in ClientData
        handleClientChange(clientIndex, e);
      }
    };

    // Name generation for inputs
    // If POA, we need "poaSurname". If Array, we just need "surname" because `handleClientChange` uses the index closure.
    const getName = (field: string) => {
      if (isPOA) return `poa${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      return field;
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in duration-300">
        
        {/* Name Breakdown */}
        <div className={config.showNames ? "md:col-span-4" : "md:col-span-12"}>
          <label className={labelClass}>{config.surnameLabel} <span className="text-red-500">*</span></label>
          <input
            name={getName("surname")}
            value={getValue("surname") || ""} 
            onChange={handleChangeWrapper}
            className={inputClass}
            placeholder={config.surnameLabel}
            required
          />
        </div>

        {config.showNames && (
          <>
            <div className="md:col-span-4">
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
              <input
                name={getName("firstName")}
                value={getValue("firstName") || ""}
                onChange={handleChangeWrapper}
                className={inputClass}
                placeholder="First Name"
                required
              />
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>Middle Name</label>
              <input
                name={getName("middleName")}
                value={getValue("middleName") || ""}
                onChange={handleChangeWrapper}
                className={inputClass}
                placeholder="Father/Husband's Name"
              />
            </div>
          </>
        )}

        {/* Personal Stats */}
        {config.showPersonalStats && (
          <div className="md:col-span-4">
            <label className={labelClass}>Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              name={getName("clientAge")}
              value={getValue("clientAge") || ""}
              onChange={handleChangeWrapper}
              className={inputClass}
              placeholder="Yrs"
              required
            />
          </div>
        )}

        {config.showPersonalStats && (
          <div className="md:col-span-4">
            <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
            <div className={iconInputWrapperClass}>
              <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300">
                  <Phone className="text-gray-500 w-5 h-5" />
              </div>
              <input
                type="tel"
                name={getName("clientPhone")}
                value={getValue("clientPhone") || ""}
                onChange={handleChangeWrapper}
                className={transparentInputClass}
                placeholder="9876543210"
                maxLength={15}
                required
              />
            </div>
          </div>
        )}

        {config.showPersonalStats && (
          <div className="md:col-span-4">
            <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
            <div className={iconInputWrapperClass}>
              <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300">
                  <Users className="text-gray-500 w-5 h-5" />
              </div>
              <select
                name={getName("gender")}
                value={getValue("gender") || ""}
                onChange={handleChangeWrapper}
                className={`${transparentInputClass} cursor-pointer`}
                required
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        )}

        {/* PAN Card */}
        <div className="md:col-span-6">
          <label className={labelClass}>PAN Card <span className="text-red-500">*</span></label>
          <div className={iconInputWrapperClass}>
            <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300">
                <CreditCard className="text-gray-500 w-5 h-5" />
            </div>
            <input
              name={getName("panCard")}
              value={getValue("panCard") || ""}
              onChange={handleChangeWrapper}
              className={transparentInputClass}
              placeholder="ABCDE1234F"
              required
            />
          </div>
        </div>

        {/* CIN Number */}
        {config.showCin && (
          <div className="md:col-span-6">
            <label className={labelClass}>CIN No. <span className="text-red-500">*</span></label>
            <div className={iconInputWrapperClass}>
              <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300">
                  <Hash className="text-gray-500 w-5 h-5" />
              </div>
              <input
                name={getName("cinNo")}
                value={getValue("cinNo") || ""}
                onChange={handleChangeWrapper}
                className={transparentInputClass}
                placeholder="CIN Number"
                required
              />
            </div>
          </div>
        )}

        {/* Address Section */}
        <div className="md:col-span-12 mt-6">
          <div className="flex items-center gap-2 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {config.addressHeader}
              </span>
              <div className="h-px bg-gray-300 flex-1"></div>
          </div>
        </div>

        <div className="md:col-span-6">
          <label className={labelClass}>Building Name <span className="text-red-500">*</span></label>
          <input
            name={getName("aadharBuilding")}
            value={getValue("aadharBuilding") || ""}
            onChange={handleChangeWrapper}
            className={inputClass}
            required
          />
        </div>
        <div className="md:col-span-6">
          <label className={labelClass}>Flat No. <span className="text-red-500">*</span></label>
          <input
            name={getName("aadharFlat")}
            value={getValue("aadharFlat") || ""}
            onChange={handleChangeWrapper}
            className={inputClass}
            required
          />
        </div>
        <div className="md:col-span-6">
          <label className={labelClass}>Road <span className="text-red-500">*</span></label>
          <input
            name={getName("aadharRoad")}
            value={getValue("aadharRoad") || ""}
            onChange={handleChangeWrapper}
            className={inputClass}
            required
          />
        </div>
        <div className="md:col-span-6">
          <label className={labelClass}>Location / Landmark <span className="text-red-500">*</span></label>
          <input
            name={getName("aadharLocation")}
            value={getValue("aadharLocation") || ""}
            onChange={handleChangeWrapper}
            className={inputClass}
            required
          />
        </div>
        <div className="md:col-span-6">
          <label className={labelClass}>Village / City <span className="text-red-500">*</span></label>
          <input
            name={getName("aadharVillage")}
            value={getValue("aadharVillage") || ""}
            onChange={handleChangeWrapper}
            className={inputClass}
            required
          />
        </div>
        <div className="md:col-span-6">
          <label className={labelClass}>Pin Code <span className="text-red-500">*</span></label>
          <input
            name={getName("aadharPincode")}
            value={getValue("aadharPincode") || ""}
            onChange={handleChangeWrapper}
            className={inputClass}
            required
          />
        </div>

        {config.showStateDistrict && (
          <>
             <div className="md:col-span-6">
              <label className={labelClass}>District <span className="text-red-500">*</span></label>
              <input
                name={getName("aadharDistrict")}
                value={getValue("aadharDistrict") || ""}
                onChange={handleChangeWrapper}
                className={inputClass}
                required
              />
            </div>
            <div className="md:col-span-6">
              <label className={labelClass}>State <span className="text-red-500">*</span></label>
              <input
                name={getName("aadharState")}
                value={getValue("aadharState") || ""}
                onChange={handleChangeWrapper}
                className={inputClass}
                required
              />
            </div>
          </>
        )}
      </div>
    );
  }

  const currentEntityConfig = getEntityConfig(formData.partyEntityType);

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 flex justify-center font-sans selection:bg-orange-200"
      style={{
        background: `radial-gradient(circle at 12% 18%, #f1e7ff 0%, transparent 60%), radial-gradient(circle at 60% 8%, #cfeee6 0%, transparent 55%), radial-gradient(circle at 92% 15%, #fff2c9 0%, transparent 60%), #ffffff`
      }}
    >
      <div className="max-w-4xl w-full space-y-8 relative">
        
       {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-white/80 shadow-sm mb-4">
             <FileText className="w-8 h-8 text-orange-500" />
          </div>
          <div className="flex items-center justify-center gap-4 relative">
            <button onClick={() => router.push("/")} type="button" className="p-2 rounded-full bg-white/60 hover:bg-white border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-600 transition-all shadow-sm backdrop-blur-sm group"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></button>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Rental Agreement Form</h1>
          </div>
          <p className="text-gray-600 font-bold max-w-lg mx-auto">Please fill in the property and agreement details below to generate your legal document.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION 1: CLIENT DETAILS */}
             <div className="bg-white/70 backdrop-blur-xl border-2 border-white/80 ring-1 ring-gray-900/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-200"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-sm"><Contact size={20} /></div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900">Client Details</h2>
                 <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Personal Information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* 1. Client Type Selection */}
              <div className="md:col-span-6">
                <label className={labelClass}>Select Client Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  {["Owner", "Tenant"].map((type) => {
                    const isSelected = formData.clientType === type;
                    return (
                      <label key={type} className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-3 transition-all ${isSelected ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-1 ring-emerald-200" : "bg-white/50 border-gray-300 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/30"}`}>
                        <input type="radio" name="clientType" value={type} checked={isSelected} onChange={handleGeneralChange} className="hidden" required />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                        <span className="font-bold">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* NEW: Client Count Dropdown */}
              <div className="md:col-span-6">
                <label className={labelClass}>No. of Clients ({formData.clientType}s) <span className="text-red-500">*</span></label>
                <div className={iconInputWrapperClass}>
                  <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300">
                     <Users className="text-gray-500 w-5 h-5" />
                  </div>
                  <select
                    name="clientCount"
                    value={formData.clientCount}
                    onChange={handleClientCountChange}
                    className={`${transparentInputClass} cursor-pointer`}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. DYNAMIC Party Type */}
              <div className="md:col-span-6">
                <label className={labelClass}>Party Type <span className="text-red-500">*</span></label>
                <div className={iconInputWrapperClass}>
                  <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><Briefcase className="text-gray-500 w-5 h-5" /></div>
                  <select name="partyType" value={formData.partyType} onChange={handleGeneralChange} className={`${transparentInputClass} cursor-pointer`} required>
                    <option value="">Select Party Type</option>
                    {formData.clientType === "Owner" ? <option>Licensor / Owner</option> : <option>Licensee / Tenant</option>}
                    <option>Authorised Signatory</option>
                    <option>Power of Attorney Holder</option>
                  </select>
                </div>
              </div>

              {/* 3. Entity Type */}
              <div className="md:col-span-6">
                <label className={labelClass}>Party Entity Type <span className="text-red-500">*</span></label>
                <div className={iconInputWrapperClass}>
                  <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><Building2 className="text-gray-500 w-5 h-5" /></div>
                  <select name="partyEntityType" value={formData.partyEntityType} onChange={handleGeneralChange} className={`${transparentInputClass} cursor-pointer`} required>
                    <option value="">Select Entity Type</option>
                    <option>Individual / Self</option>
                    <option>Proprietorship</option>
                    <option>Partnership</option>
                    <option>Limited Liability Partnership</option>
                    <option>Private Limited Company</option>
                    <option>Central Government Department</option>
                    <option>Central Government Undertaking</option>
                    <option>State Government Undertaking</option>
                  </select>
                </div>
              </div>

              {/* 4. Executing (Radio) */}
              <div className="md:col-span-12 mb-2">
                <label className={labelClass}>Executing <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {["Self", "Through POA"].map((type) => {
                    const isSelected = formData.executing === type;
                    const isDisabled = type === "Self" && (
                      (formData.clientType === "Tenant" && formData.partyEntityType !== "" && formData.partyEntityType !== "Individual / Self")
                    );

                    return (
                      <label key={type} className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-3 transition-all ${isDisabled ? "opacity-50 bg-gray-100 cursor-not-allowed border-gray-200" : ""} ${isSelected && !isDisabled ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-1 ring-emerald-200" : !isDisabled ? "bg-white/50 border-gray-300 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/30" : ""}`}>
                        <input type="radio" name="executing" value={type} checked={isSelected} onChange={handleGeneralChange} className="hidden" required disabled={isDisabled} />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                        <span className="font-bold">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-12 h-px bg-gray-300 my-2"></div>

              {formData.executing === "Self" ? (
                // --- CASE 1: SELF (Loop through all clients) ---
                <>
                  {formData.clients.map((client, index) => (
                    <div key={index} className="md:col-span-12 bg-white/40 p-6 rounded-2xl border-2 border-emerald-100/50 mt-4 relative">
                      {/* Only show header if more than 1 client or just for visual consistency */}
                      <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm uppercase tracking-wide">
                        {formData.clientType} No. {index + 1} 
                      </div>
                      
                      {renderPersonalDetails(false, index, currentEntityConfig)}
                    </div>
                  ))}
                </>
              ) : (
                // --- CASE 2: THROUGH POA (Double Form) ---
                <>
                  {/* SECTION A: ORIGINAL OWNERS (Loop) */}
                  {formData.clients.map((client, index) => (
                     <div key={index} className="md:col-span-12 bg-white/50 p-6 rounded-2xl border-2 border-emerald-100 mb-4 relative mt-4">
                        <div className="absolute -top-3 left-4 bg-white text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-emerald-100 shadow-sm uppercase tracking-wide z-10">
                          {formData.clientType} No. {index + 1}
                        </div>
                        <div className="flex items-center gap-2 mb-6 text-emerald-800 mt-2">
                          <User className="w-5 h-5" />
                          <h3 className="font-bold text-lg">{currentEntityConfig.headerTitle}</h3>
                        </div>
                        {renderPersonalDetails(false, index, currentEntityConfig)}
                     </div>
                  ))}

                  {/* SECTION B: AUTHORIZED PERSON (POA) - Single Entity usually */}
                  <div className="md:col-span-12 bg-emerald-50/50 p-6 rounded-2xl border-2 border-emerald-200 mt-6">
                    <div className="flex items-center gap-2 mb-6 text-emerald-800">
                      <UserCheck className="w-5 h-5" />
                      <h3 className="font-bold text-lg">Authorized Person (POA Holder)</h3>
                    </div>
                    {/* Render POA Person (isPOA = true) */}
                    {renderPersonalDetails(true)}
                  </div>
                </>
              )}

            </div>
          </div>

          {/* ================================================= */}
          {/* SECTION 2 — PROPERTY DETAILS                      */}
          {/* ================================================= */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/80 ring-1 ring-gray-900/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm"><Home size={20} /></div>
              <div><h2 className="text-xl font-bold text-gray-900">Property Details</h2><p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Location & Unit Info</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6">
                <label className={labelClass}>Type of Unit <span className="text-red-500">*</span></label>
                <div className={iconInputWrapperClass}>
                   <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><Building2 className="text-gray-500 w-5 h-5" /></div>
                  <select name="unitType" value={formData.unitType} onChange={handleGeneralChange} className={`${transparentInputClass} cursor-pointer`} required>
                    <option value="">Select Unit Type</option><option>Apartment / Flat</option><option>Godown</option><option>Land + Building / Shed</option><option>Office</option><option>Shop</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-12">
                <label className={labelClass}>Full Address <span className="text-red-500">*</span></label>
                <div className={iconInputWrapperClass}>
                  <div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><MapPin className="text-gray-500 w-5 h-5" /></div>
                  <input name="address" value={formData.address} onChange={handleGeneralChange} className={transparentInputClass} placeholder="House No, Street Area" required />
                </div>
              </div>
              <div className="md:col-span-6"><label className={labelClass}>Building Name <span className="text-red-500">*</span></label><input name="buildingName" value={formData.buildingName} onChange={handleGeneralChange} className={inputClass} placeholder="e.g. Galaxy Heights" required /></div>
              <div className="md:col-span-6"><label className={labelClass}>Flat Number <span className="text-red-500">*</span></label><input name="flatNumber" value={formData.flatNumber} onChange={handleGeneralChange} className={inputClass} placeholder="e.g. B-402" required /></div>
              <div className="md:col-span-5"><label className={labelClass}>Road / Street <span className="text-red-500">*</span></label><input name="road" value={formData.road} onChange={handleGeneralChange} className={inputClass} required /></div>
              <div className="md:col-span-4"><label className={labelClass}>Village / Area <span className="text-red-500">*</span></label><input name="village" value={formData.village} onChange={handleGeneralChange} className={inputClass} required /></div>
              <div className="md:col-span-3"><label className={labelClass}>Pincode <span className="text-red-500">*</span></label><input name="pincode" value={formData.pincode} onChange={handleGeneralChange} className={inputClass} placeholder="000000" required /></div>
              <div className="md:col-span-12 pt-2">
                <label className={labelClass}>Residential Status <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Residential", "Non-Residential"].map((status) => {
                    const isSelected = formData.residentialStatus === status;
                    return (
                      <label key={status} className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all select-none ${isSelected ? "bg-blue-50 border-blue-500 ring-1 ring-blue-200 shadow-md" : "bg-white/50 border-gray-300 hover:border-blue-300 hover:bg-blue-50/30"}`}>
                         <input type="radio" name="residentialStatus" value={status} checked={isSelected} onChange={handleGeneralChange} className="hidden" required/>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                        <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{status}</span>{isSelected && <Check className="ml-auto w-5 h-5 text-blue-600" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* SECTION 3 — RENT AGREEMENT DETAILS                */}
          {/* ================================================= */}
          <div className="bg-white/70 backdrop-blur-xl border-2 border-white/80 ring-1 ring-gray-900/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-200"></div>
             <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm"><FileText size={20} /></div>
              <div><h2 className="text-xl font-bold text-gray-900">Agreement Terms</h2><p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Duration & Financials</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6"><label className={labelClass}>Duration (Months) <span className="text-red-500">*</span></label><input type="number" min={11} max={60} name="agreementMonths" value={formData.agreementMonths} onChange={handleGeneralChange} className={inputClass} placeholder="e.g. 11" required /><p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wide">Min 11 - Max 60 months</p></div>
              <div className="md:col-span-6"><label className={labelClass}>Start Date <span className="text-red-500">*</span></label><div className={iconInputWrapperClass}><div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><Calendar className="text-gray-500 w-5 h-5" /></div><input type="date" name="fromDate" value={formData.fromDate} onChange={handleGeneralChange} className={transparentInputClass} required /></div></div>
              <div className="md:col-span-6"><label className={labelClass}>Deposit Amount <span className="text-red-500">*</span></label><div className={iconInputWrapperClass}><div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><IndianRupee className="text-gray-500 w-4 h-4" /></div><input name="deposit" value={formData.deposit} onChange={handleGeneralChange} className={`${transparentInputClass} font-mono font-bold text-lg`} placeholder="0.00" required /></div></div>
              <div className="md:col-span-6"><label className={labelClass}>Monthly Rent <span className="text-red-500">*</span></label><div className={iconInputWrapperClass}><div className="w-12 self-stretch flex items-center justify-center bg-gray-100 border-r-2 border-gray-300"><IndianRupee className="text-gray-500 w-4 h-4" /></div><input name="rent" value={formData.rent} onChange={handleGeneralChange} className={`${transparentInputClass} font-mono font-bold text-lg`} placeholder="0.00" required /></div></div>
              
              <div className="md:col-span-12 bg-indigo-50/50 rounded-2xl p-6 border-2 border-indigo-100 mt-2 border-dashed">
                <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-wider"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Rent Escalation (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClass}>Effective From Month</label><input name="varyingMonth" value={formData.varyingMonth} onChange={handleGeneralChange} className={inputClass} placeholder="e.g. 12" /></div>
                  <div><label className={labelClass}>New Rent Amount</label><div className={iconInputWrapperClass}><div className="w-12 self-stretch flex items-center justify-center bg-white border-r-2 border-gray-300"><IndianRupee className="text-gray-500 w-4 h-4" /></div><input name="varyingRent" value={formData.varyingRent} onChange={handleGeneralChange} className={`${transparentInputClass} font-mono font-bold`} placeholder="0.00" /></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 border-2 border-orange-500 flex items-center gap-2"><CheckCircle2 size={20} />Submit Agreement</button>
          </div>
        </form>
      </div>
    </div>
  );
}