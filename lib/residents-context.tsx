"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated";

export interface Resident {
  id: string;
  fullName: string;
  age: number;
  purok: string;
  address: string;
  mobileNumber: string;
  email?: string;
  yearsOfResidency: number;
  occupation: string;
  civilStatus: CivilStatus;
  createdAt: string;
  updatedAt: string;
}

interface ResidentsContextType {
  residents: Resident[];
  addResident: (resident: Omit<Resident, "id" | "createdAt" | "updatedAt">) => Resident;
  updateResident: (id: string, updates: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  getResident: (id: string) => Resident | undefined;
  searchResidents: (query: string) => Resident[];
  getResidentsByPurok: (purok: string) => Resident[];
}

const ResidentsContext = createContext<ResidentsContextType | undefined>(undefined);

const STORAGE_KEY = "barangay_residents";

const FIRST_NAMES = ["Juan", "Maria", "Jose", "Ana", "Pedro", "Rosa", "Antonio", "Teresa", "Manuel", "Elena", "Ricardo", "Carmen", "Francisco", "Luz", "Gregorio", "Consuelo"];
const LAST_NAMES = ["Dela Cruz", "Santos", "Reyes", "Garcia", "Ramos", "Torres", "Mendoza", "Cruz", "Bautista", "Gonzales", "Villanueva", "Mercado", "Pascual", "Castillo"];
const OCCUPATIONS = ["Tricycle Driver", "Sari-sari Store Owner", "Barangay Tanod", "Teacher", "Construction Worker", "Farmer", "Vendor", "Factory Worker", "Security Guard", "Housewife", "Student", "Retired", "Jeepney Driver", "Carpenter", "Electrician", "Plumber", "Tailor", "Hairdresser", "Mechanic", "Nurse"];
const PUROKS = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5", "Purok 6"];
const CIVIL_STATUSES: CivilStatus[] = ["Single", "Married", "Widowed", "Separated"];
const MOBILE_PREFIXES = ["917", "918", "919", "920", "921", "922", "923", "924", "925", "926", "927", "928", "929", "939", "949", "959", "969", "979", "989", "999"];

export function ResidentsProvider({ children }: { children: React.ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResidents(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored residents", e);
        seedData();
      }
    } else {
      seedData();
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(residents));
    }
  }, [residents, isInitialized]);

  const seedData = () => {
    const seededResidents: Resident[] = [];
    const count = 40; // Seeding 40 residents as per 30-50 range

    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const fullName = `${firstName} ${lastName}`;
      
      // Age distribution
      let age: number;
      const ageRand = Math.random();
      if (ageRand < 0.2) age = Math.floor(Math.random() * (25 - 18 + 1)) + 18;
      else if (ageRand < 0.5) age = Math.floor(Math.random() * (40 - 26 + 1)) + 26;
      else if (ageRand < 0.8) age = Math.floor(Math.random() * (60 - 41 + 1)) + 41;
      else age = Math.floor(Math.random() * (80 - 61 + 1)) + 61;

      const purok = PUROKS[i % PUROKS.length];
      const houseNum = Math.floor(Math.random() * 100) + 1;
      const lotNum = Math.floor(Math.random() * 50) + 1;
      const address = `Block ${houseNum} Lot ${lotNum}, ${purok}, Barangay Mawaque, Mabalacat, Pampanga`;
      
      const prefix = MOBILE_PREFIXES[Math.floor(Math.random() * MOBILE_PREFIXES.length)];
      const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
      const mobileNumber = `+63 ${prefix} ${suffix.substring(0, 3)} ${suffix.substring(3)}`;

      let email: string | undefined = undefined;
      if (Math.random() < 0.6) {
        const domain = Math.random() > 0.5 ? "gmail.com" : "yahoo.com";
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}${Math.floor(Math.random() * 100)}@${domain}`;
      }

      const yearsOfResidency = Math.min(age - 17, Math.floor(Math.random() * 40) + 1);
      const occupation = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
      
      // Civil status distribution
      let civilStatus: CivilStatus;
      const csRand = Math.random();
      if (csRand < 0.3) civilStatus = "Single";
      else if (csRand < 0.8) civilStatus = "Married";
      else if (csRand < 0.95) civilStatus = "Widowed";
      else civilStatus = "Separated";

      const now = new Date().toISOString();

      seededResidents.push({
        id: crypto.randomUUID(),
        fullName,
        age,
        purok,
        address,
        mobileNumber,
        email,
        yearsOfResidency,
        occupation,
        civilStatus,
        createdAt: now,
        updatedAt: now,
      });
    }

    setResidents(seededResidents);
  };

  const addResident = (data: Omit<Resident, "id" | "createdAt" | "updatedAt">): Resident => {
    const now = new Date().toISOString();
    const newResident: Resident = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setResidents((prev) => [...prev, newResident]);
    return newResident;
  };

  const updateResident = (id: string, updates: Partial<Resident>) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updates, updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  const deleteResident = (id: string) => {
    setResidents((prev) => prev.filter((r) => r.id !== id));
  };

  const getResident = (id: string) => {
    return residents.find((r) => r.id === id);
  };

  const searchResidents = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return residents.filter(
      (r) =>
        r.fullName.toLowerCase().includes(lowerQuery) ||
        r.purok.toLowerCase().includes(lowerQuery) ||
        r.address.toLowerCase().includes(lowerQuery)
    );
  };

  const getResidentsByPurok = (purok: string) => {
    return residents.filter((r) => r.purok === purok);
  };

  return (
    <ResidentsContext.Provider
      value={{
        residents,
        addResident,
        updateResident,
        deleteResident,
        getResident,
        searchResidents,
        getResidentsByPurok,
      }}
    >
      {children}
    </ResidentsContext.Provider>
  );
}

export function useResidents() {
  const context = useContext(ResidentsContext);
  if (context === undefined) {
    throw new Error("useResidents must be used within a ResidentsProvider");
  }
  return context;
}
