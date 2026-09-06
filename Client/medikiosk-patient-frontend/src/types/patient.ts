export interface Patient {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
}
