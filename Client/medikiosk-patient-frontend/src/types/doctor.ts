export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  location: string;
  rating: number;
  yearsExperience: number;
  slots: AppointmentSlot[];
}
