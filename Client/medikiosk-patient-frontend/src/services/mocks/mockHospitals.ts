import type { Hospital } from "@/types/hospital";

/**
 * Fixed mock hospital directory. A real implementation would look
 * these up by the patient's location/insurance network — swapping
 * this file for a live call is the only change needed; pages only
 * ever deal with Hospital objects (see hospitalService.ts).
 */
export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "hosp-apollo-sarita-vihar",
    name: "Apollo Hospital, Sarita Vihar",
    address: "Sarita Vihar, Delhi Mathura Road",
    city: "Delhi",
    distanceKm: 3.2,
    departments: ["General Medicine", "Neurology", "Cardiology", "Orthopedics"],
    rating: 4.5,
  },
  {
    id: "hosp-max-saket",
    name: "Max Super Speciality Hospital, Saket",
    address: "1, Press Enclave Road, Saket",
    city: "Delhi",
    distanceKm: 5.8,
    departments: ["General Medicine", "Cardiology", "Gastroenterology", "Pediatrics"],
    rating: 4.6,
  },
  {
    id: "hosp-fortis-okhla",
    name: "Fortis Escorts Heart Institute, Okhla",
    address: "Okhla Road, Sukhdev Vihar",
    city: "Delhi",
    distanceKm: 4.1,
    departments: ["Cardiology", "General Medicine", "Neurology"],
    rating: 4.4,
  },
  {
    id: "hosp-aiims",
    name: "AIIMS, New Delhi",
    address: "Ansari Nagar, New Delhi",
    city: "Delhi",
    distanceKm: 7.5,
    departments: ["General Medicine", "Neurology", "Orthopedics", "Dermatology"],
    rating: 4.7,
  },
  {
    id: "hosp-ganga-ram",
    name: "Sir Ganga Ram Hospital, Rajinder Nagar",
    address: "Rajinder Nagar, New Delhi",
    city: "Delhi",
    distanceKm: 6.3,
    departments: ["General Medicine", "Gastroenterology", "Orthopedics"],
    rating: 4.3,
  },
];
