import type { Patient } from "@/types/patient";

/**
 * In-memory mock "ABDM account database". Real ABHA login/creation
 * will live behind FastAPI + the actual ABDM APIs; this exists only
 * so the login/signup flow has real create-then-authenticate behavior
 * to demo against. Resets on page reload — nothing here is persisted.
 */
interface MockAccount {
  abhaId: string;
  password: string;
  patient: Patient;
}

const mockAccountStore = new Map<string, MockAccount>();

/** A couple of pre-seeded accounts so "returning patient" login can be
 * demoed immediately, without creating an account first. */
function seedDemoAccounts() {
  const demoAccounts: MockAccount[] = [
    {
      abhaId: "14-1234-5678-9012",
      password: "Demo@123",
      patient: {
        id: "mock-patient-demo1",
        abhaId: "14-1234-5678-9012",
        name: "Asha Verma",
        age: 34,
        gender: "female",
        phone: "9876543210",
      },
    },
    {
      abhaId: "ramesh.nair@abdm",
      password: "Demo@123",
      patient: {
        id: "mock-patient-demo2",
        abhaId: "ramesh.nair@abdm",
        name: "Ramesh Nair",
        age: 61,
        gender: "male",
        phone: "9812345678",
      },
    },
  ];
  demoAccounts.forEach((account) =>
    mockAccountStore.set(normalizeAbhaId(account.abhaId), account)
  );
}
seedDemoAccounts();

function normalizeAbhaId(abhaId: string): string {
  return abhaId.trim().toLowerCase();
}

export function findMockAccount(abhaId: string): MockAccount | undefined {
  return mockAccountStore.get(normalizeAbhaId(abhaId));
}

export interface RegisterMockAccountInput {
  abhaId: string;
  password: string;
  name: string;
  age: number;
  gender: Patient["gender"];
  phone: string;
}

export function registerMockAccount(
  input: RegisterMockAccountInput
): MockAccount {
  const key = normalizeAbhaId(input.abhaId);
  const patient: Patient = {
    id: `mock-patient-${key.replace(/[^a-z0-9]/g, "").slice(-8) || "0001"}`,
    abhaId: input.abhaId.trim(),
    name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    phone: input.phone.trim(),
  };
  const account: MockAccount = { abhaId: input.abhaId.trim(), password: input.password, patient };
  mockAccountStore.set(key, account);
  return account;
}
