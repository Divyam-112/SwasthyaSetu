/**
 * Mock patient queue for a single doctor's workday.
 * In production this would be fetched from FastAPI: GET /doctor/queue
 */

export type QueueStatus = "waiting" | "seen" | "flagged" | "in-progress";
export type ReportStatus = "verified" | "needs-review" | "pending";

export interface QueueEntry {
  queueNo: number;
  patientId: string;
  patientName: string;
  age: number;
  gender: "male" | "female" | "other";
  chiefComplaint: string;
  reportStatus: ReportStatus;
  queueStatus: QueueStatus;
  waitMinutes: number;
  abhaId: string;
  phone: string;
}

export const mockQueue: QueueEntry[] = [
  {
    queueNo: 1,
    patientId: "mock-patient-demo1",
    patientName: "Asha Verma",
    age: 34,
    gender: "female",
    chiefComplaint: "Persistent fever & body ache",
    reportStatus: "verified",
    queueStatus: "seen",
    waitMinutes: 0,
    abhaId: "14-1234-5678-9012",
    phone: "9876543210",
  },
  {
    queueNo: 2,
    patientId: "mock-patient-demo2",
    patientName: "Ramesh Nair",
    age: 61,
    gender: "male",
    chiefComplaint: "Chest pain on exertion",
    reportStatus: "needs-review",
    queueStatus: "in-progress",
    waitMinutes: 5,
    abhaId: "ramesh.nair@abdm",
    phone: "9812345678",
  },
  {
    queueNo: 3,
    patientId: "pat-003",
    patientName: "Sunita Devi",
    age: 47,
    gender: "female",
    chiefComplaint: "Knee pain, difficulty walking",
    reportStatus: "verified",
    queueStatus: "waiting",
    waitMinutes: 12,
    abhaId: "22-9988-7766-5544",
    phone: "9001234567",
  },
  {
    queueNo: 4,
    patientId: "pat-004",
    patientName: "Mohammed Iqbal",
    age: 29,
    gender: "male",
    chiefComplaint: "Recurring headache for 2 weeks",
    reportStatus: "needs-review",
    queueStatus: "waiting",
    waitMinutes: 18,
    abhaId: "11-2233-4455-6677",
    phone: "9123456780",
  },
  {
    queueNo: 5,
    patientId: "pat-005",
    patientName: "Kavitha Rao",
    age: 52,
    gender: "female",
    chiefComplaint: "High blood sugar, fatigue",
    reportStatus: "verified",
    queueStatus: "waiting",
    waitMinutes: 24,
    abhaId: "33-4455-6677-8899",
    phone: "9345678901",
  },
  {
    queueNo: 6,
    patientId: "pat-006",
    patientName: "Arjun Singh",
    age: 19,
    gender: "male",
    chiefComplaint: "Skin rash on arms & neck",
    reportStatus: "pending",
    queueStatus: "waiting",
    waitMinutes: 31,
    abhaId: "44-5566-7788-9900",
    phone: "9456789012",
  },
  {
    queueNo: 7,
    patientId: "pat-007",
    patientName: "Geeta Mishra",
    age: 68,
    gender: "female",
    chiefComplaint: "Shortness of breath at rest",
    reportStatus: "needs-review",
    queueStatus: "flagged",
    waitMinutes: 8,
    abhaId: "55-6677-8899-0011",
    phone: "9567890123",
  },
  {
    queueNo: 8,
    patientId: "pat-008",
    patientName: "Vikas Patel",
    age: 41,
    gender: "male",
    chiefComplaint: "Stomach pain after meals",
    reportStatus: "verified",
    queueStatus: "waiting",
    waitMinutes: 39,
    abhaId: "66-7788-9900-1122",
    phone: "9678901234",
  },
  {
    queueNo: 9,
    patientId: "pat-009",
    patientName: "Lakshmi Iyer",
    age: 36,
    gender: "female",
    chiefComplaint: "Irregular menstrual cycle, fatigue",
    reportStatus: "pending",
    queueStatus: "waiting",
    waitMinutes: 44,
    abhaId: "77-8899-0011-2233",
    phone: "9789012345",
  },
  {
    queueNo: 10,
    patientId: "pat-010",
    patientName: "Deepak Chauhan",
    age: 55,
    gender: "male",
    chiefComplaint: "Back pain radiating to left leg",
    reportStatus: "needs-review",
    queueStatus: "waiting",
    waitMinutes: 50,
    abhaId: "88-9900-1122-3344",
    phone: "9890123456",
  },
];
