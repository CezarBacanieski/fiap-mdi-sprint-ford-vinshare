import { NewServiceInput, NewVehicleInput, User } from "../types";
import { AppSecurityError } from "./errors";
import { assertSafePayload, normalizeText, sanitizeNumeric, sanitizeText } from "./sanitization";

const textPattern = /^[\p{L}\p{N} .,'\-_/()+]{1,80}$/u;
const extendedTextPattern = /^[\p{L}\p{N} .,'\-_/()#+]{0,280}$/u;
const platePattern = /^([A-Z]{3}-?\d[A-Z0-9]\d{2})$/;
const cepPattern = /^\d{8}$/;

const ensurePattern = (value: string, pattern: RegExp, code: string, message: string): string => {
  if (!pattern.test(value)) {
    throw new AppSecurityError(message, {
      code,
      status: 422,
      publicMessage: "Um ou mais campos possuem formato inválido.",
    });
  }
  return value;
};

const ensureNumber = (value: number, min: number, max: number, code: string): number => {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new AppSecurityError("Invalid numeric range", {
      code,
      status: 422,
      publicMessage: "Um ou mais campos numéricos estão fora do intervalo aceito.",
    });
  }
  return value;
};

export const sanitizeRouteId = (value: string): string => {
  const normalized = sanitizeText(value).toLowerCase();
  return ensurePattern(
    normalized,
    /^[a-z]-\d{3,18}$/,
    "INVALID_ROUTE_ID",
    "Route id contains invalid chars",
  );
};

export const sanitizeSearchTerm = (value: string): string => {
  const normalized = sanitizeText(value).slice(0, 60);
  if (!normalized) return "";
  assertSafePayload(normalized);
  return ensurePattern(normalized, /^[\p{L}\p{N} .,'\-_/()]+$/u, "INVALID_SEARCH", "Invalid search");
};

export const sanitizeCep = (value: string): string => {
  const digits = sanitizeNumeric(value);
  return ensurePattern(digits, cepPattern, "INVALID_CEP", "Invalid CEP");
};

export const validateVehicleInput = (input: NewVehicleInput): NewVehicleInput => {
  const brand = sanitizeText(input.brand);
  const model = sanitizeText(input.model);
  const version = sanitizeText(input.version);
  const plate = sanitizeText(input.plate).toUpperCase();
  const color = sanitizeText(input.color);

  [brand, model, version, plate, color].forEach(assertSafePayload);

  return {
    brand: ensurePattern(brand, textPattern, "INVALID_BRAND", "Invalid brand"),
    model: ensurePattern(model, textPattern, "INVALID_MODEL", "Invalid model"),
    version: ensurePattern(version || "Versao nao informada", textPattern, "INVALID_VERSION", "Invalid version"),
    year: ensureNumber(input.year, 1990, 2035, "INVALID_YEAR"),
    plate: ensurePattern(plate, platePattern, "INVALID_PLATE", "Invalid plate"),
    mileage: ensureNumber(input.mileage, 0, 2_000_000, "INVALID_MILEAGE"),
    fuelType: input.fuelType,
    color: ensurePattern(color || "Cor nao informada", textPattern, "INVALID_COLOR", "Invalid color"),
  };
};

export const validateServiceInput = (input: NewServiceInput): NewServiceInput => {
  const notes = sanitizeText(input.notes).slice(0, 280);
  const time = normalizeText(input.time);
  const date = normalizeText(input.date);

  assertSafePayload(notes);

  const serviceTypes = input.serviceTypes.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 6);

  if (serviceTypes.length === 0) {
    throw new AppSecurityError("Empty service types", {
      code: "INVALID_SERVICE_TYPES",
      status: 422,
      publicMessage: "Selecione pelo menos um tipo de serviço.",
    });
  }

  return {
    vehicleId: sanitizeRouteId(input.vehicleId),
    serviceTypes: serviceTypes.map((type) =>
      ensurePattern(type, textPattern, "INVALID_SERVICE_TYPE", "Invalid service type"),
    ),
    mileage: ensureNumber(input.mileage, 0, 2_000_000, "INVALID_SERVICE_MILEAGE"),
    dealershipId: sanitizeRouteId(input.dealershipId),
    date: ensurePattern(date, /^\d{4}-\d{2}-\d{2}$/, "INVALID_DATE", "Invalid date"),
    time: ensurePattern(time, /^\d{2}:\d{2}$/, "INVALID_TIME", "Invalid time"),
    notes: ensurePattern(notes, extendedTextPattern, "INVALID_NOTES", "Invalid notes"),
  };
};

export const validateUserProfileInput = (input: User): User => {
  const name = sanitizeText(input.name);
  const email = sanitizeText(input.email).toLowerCase();
  const phone = sanitizeText(input.phone);

  [name, email, phone].forEach(assertSafePayload);

  return {
    ...input,
    name: ensurePattern(name, /^[\p{L} .'-]{2,80}$/u, "INVALID_NAME", "Invalid name"),
    email: ensurePattern(
      email,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "INVALID_EMAIL",
      "Invalid email",
    ),
    phone: ensurePattern(
      phone,
      /^[+\d()\s-]{8,24}$/,
      "INVALID_PHONE",
      "Invalid phone",
    ),
  };
};
