// TODO: replace mock implementation with real FastAPI calls via apiRequest().
// Keep the exported function names and shapes stable — pages depend on
// these signatures, not on how they're implemented.
import type { Patient } from "@/types/patient";
import { mockDelay } from "@/services/mocks/mockDelay";
import {
  findMockAccount,
  registerMockAccount,
  type RegisterMockAccountInput,
} from "@/services/mocks/mockPatients";
// import { apiRequest } from "./client"; // uncomment when wiring the real ABDM/FastAPI calls

export interface AbhaAuthResult {
  patient: Patient;
}

export interface AbhaSignupInput {
  abhaId: string;
  password: string;
  name: string;
  age: number;
  gender: Patient["gender"];
  phone: string;
}

/**
 * Authenticates a patient by ABHA ID + password.
 *
 * MOCK IMPLEMENTATION — does not call ABDM or any real auth provider.
 * It checks the ID/password against an in-memory mock account store
 * (seeded with a couple of demo accounts, plus anything created via
 * signupWithAbhaId in this session) and simulates network latency.
 *
 * To connect the real backend later: replace the body with
 *   return apiRequest<AbhaAuthResult>("/auth/abha/login", {
 *     method: "POST",
 *     body: JSON.stringify({ abhaId, password }),
 *   });
 * ABDM's real flow typically also involves an OTP step — if so, extend
 * this function's return type (e.g. add an `otpRequired` branch) rather
 * than changing its name or the shape callers already depend on.
 */
export async function loginWithAbhaId(
  abhaId: string,
  password: string
): Promise<AbhaAuthResult> {
  const trimmedId = abhaId.trim();

  if (!isValidAbhaIdFormat(trimmedId)) {
    await mockDelay(null, 300);
    throw new Error(
      "That doesn't look like a valid ABHA ID. Check the number or address and try again."
    );
  }

  await mockDelay(null, 1000);

  const account = findMockAccount(trimmedId);
  if (!account) {
    throw new Error(
      "We couldn't find an account with that ABHA ID. New here? Create an ABHA ID below."
    );
  }
  if (account.password !== password) {
    throw new Error("Incorrect password. Please try again.");
  }

  return { patient: account.patient };
}

/**
 * Creates a new mock ABHA account and immediately logs the patient in.
 *
 * MOCK IMPLEMENTATION — real ABHA creation goes through ABDM (Aadhaar
 * or mobile-number based verification, OTP, consent artifacts) and
 * will need several more steps than this. This exists so the "new
 * patient" path can be demoed end-to-end today.
 *
 * To connect the real backend later: replace the body with a call to
 *   apiRequest<AbhaAuthResult>("/auth/abha/signup", { method: "POST", body: ... })
 * — keep the input/output shapes stable so AbhaSignupPage doesn't change.
 */
export async function signupWithAbhaId(
  input: AbhaSignupInput
): Promise<AbhaAuthResult> {
  const trimmedId = input.abhaId.trim();

  if (!isValidAbhaIdFormat(trimmedId)) {
    await mockDelay(null, 300);
    throw new Error(
      "Enter a valid ABHA number (14 digits) or ABHA address (e.g. name@abdm)."
    );
  }
  if (!isValidPassword(input.password)) {
    await mockDelay(null, 300);
    throw new Error("Password must be at least 8 characters and include a letter and a number.");
  }

  await mockDelay(null, 1200);

  if (findMockAccount(trimmedId)) {
    throw new Error("An account with that ABHA ID already exists. Try logging in instead.");
  }

  const registerInput: RegisterMockAccountInput = { ...input, abhaId: trimmedId };
  const account = registerMockAccount(registerInput);
  return { patient: account.patient };
}

/**
 * Accepts the two real-world ABHA ID formats:
 *  - 14-digit number, optionally hyphenated (e.g. 12-3456-7890-1234)
 *  - ABHA address (e.g. asha.verma@abdm)
 * This is shape validation only, not a real ABDM lookup.
 */
export function isValidAbhaIdFormat(value: string): boolean {
  const numeric = value.replace(/-/g, "");
  const isNumericAbha = /^\d{14}$/.test(numeric);
  const isAbhaAddress = /^[a-zA-Z0-9._]{4,}@[a-zA-Z]{3,}$/.test(value);
  return isNumericAbha || isAbhaAddress;
}

/** Mock password strength rule: 8+ chars, at least one letter and one digit. */
export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value);
}
