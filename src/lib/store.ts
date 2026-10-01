export interface DriverVehicle {
  brand: string
  model: string
  plateNumber: string
  color?: string
  productionYear?: number
  seat: number
  libreDocument?: string
}

export interface DriverProfile {
  fullName?: string
  photo?: string
  tinNumber?: string
  ownsVehicle?: boolean
  employmentContract?: string
  insuranceDocument?: string
  driverLicenseDocument?: string
  businessLicenseDocument?: string
  businessRegistrationDocument?: string
  vehicle: DriverVehicle
}

export interface OperatorAccount {
  password: string
  verified: boolean
  profile: DriverProfile | null
  claimedCarIds: string[]
}

export interface CarRecord {
  id: string
  plateNumber: string
  libre: string
  brand: string
  model: string
  color?: string
  productionYear?: number
  seat: number
  ownerPhone: string
}

const OPERATORS_KEY = "kesefere.operator.accounts"
const SESSION_KEY = "kesefere.operator.session"
const CARS_KEY = "kesefere.operator.cars"

export const MOCK_OTP = "123456"

const SEED_CARS: CarRecord[] = [
  {
    id: "car-1",
    plateNumber: "3A 12345",
    libre: "AA 2021 12345",
    brand: "Toyota",
    model: "Hiace",
    color: "White",
    productionYear: 2019,
    seat: 12,
    ownerPhone: "0911223344",
  },
  {
    id: "car-2",
    plateNumber: "3B 98765",
    libre: "AA 2018 54321",
    brand: "Toyota",
    model: "Coaster",
    color: "Silver",
    productionYear: 2017,
    seat: 26,
    ownerPhone: "0911223344",
  },
  {
    id: "car-3",
    plateNumber: "3C 44556",
    libre: "AA 2022 77889",
    brand: "Toyota",
    model: "Hiace",
    color: "White",
    productionYear: 2021,
    seat: 12,
    ownerPhone: "0911223344",
  },
  {
    id: "car-4",
    plateNumber: "3A 77889",
    libre: "AA 2019 11223",
    brand: "Hyundai",
    model: "H-1",
    color: "Gray",
    productionYear: 2018,
    seat: 15,
    ownerPhone: "0922223344",
  },
  {
    id: "car-5",
    plateNumber: "3D 55667",
    libre: "AA 2020 99887",
    brand: "Mercedes-Benz",
    model: "Sprinter",
    color: "White",
    productionYear: 2019,
    seat: 20,
    ownerPhone: "0933334455",
  },
]

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getOperators(): Record<string, OperatorAccount> {
  const operators = readJSON<Record<string, OperatorAccount>>(OPERATORS_KEY, {})
  for (const car of SEED_CARS) {
    if (operators[car.ownerPhone]) {
      const owned = operators[car.ownerPhone].claimedCarIds
      if (!owned.includes(car.id)) {
        operators[car.ownerPhone].claimedCarIds = [...owned, car.id]
      }
    }
  }
  return operators
}

export function saveOperators(operators: Record<string, OperatorAccount>) {
  writeJSON(OPERATORS_KEY, operators)
}

export function getOperator(phone: string): OperatorAccount | null {
  return getOperators()[phone] ?? null
}

export function registerOperator(phone: string, password: string) {
  const operators = getOperators()
  if (operators[phone]) {
    throw new Error("This number is already registered. Sign in instead.")
  }
  operators[phone] = {
    password,
    verified: false,
    profile: null,
    claimedCarIds: [],
  }
  saveOperators(operators)
}

export function signInOperator(phone: string, password: string) {
  const operator = getOperator(phone)
  if (!operator) {
    throw new Error("No operator account found for this number. Register first.")
  }
  if (operator.password !== password) {
    throw new Error("Wrong password. Try again.")
  }
}

export function verifyOperator(phone: string) {
  const operators = getOperators()
  const operator = operators[phone]
  if (!operator) return
  operators[phone] = { ...operator, verified: true }
  saveOperators(operators)
}

export function saveDriverProfile(phone: string, profile: DriverProfile) {
  const operators = getOperators()
  const operator = operators[phone]
  if (!operator) return
  operators[phone] = { ...operator, profile }
  saveOperators(operators)
}

export interface DriverDraft {
  step: number
  tinNumber: string
  ownsVehicle: boolean | null
  brand: string
  model: string
  plateNumber: string
  color: string
  productionYear: string
  seat: string
  documents: Record<string, string>
  documentNames: Record<string, string | null>
}

const DRAFT_KEY = "kesefere.operator.driver-draft"
const DRAFT_DOCS_KEY = "kesefere.operator.driver-draft-docs"

export function getDriverDraft(): DriverDraft | null {
  const meta = readJSON<Omit<DriverDraft, "documents"> | null>(DRAFT_KEY, null)
  if (!meta) return null
  const documents = readJSON<Record<string, string>>(DRAFT_DOCS_KEY, {})
  return { ...meta, documents }
}

export function saveDriverDraft(draft: DriverDraft) {
  const { documents, ...meta } = draft
  try {
    writeJSON(DRAFT_KEY, meta)
  } catch {
    // If this ever fails, the draft is not recoverable — keep the session's
    // step lossless by splitting the heavy payload below.
  }
  try {
    writeJSON(DRAFT_DOCS_KEY, documents)
  } catch {
    // Documents are large base64 payloads and may exceed the storage quota.
    // The step + text fields above are persisted separately, so a refresh
    // still restores the correct step.
  }
}

export function clearDriverDraft() {
  localStorage.removeItem(DRAFT_KEY)
  localStorage.removeItem(DRAFT_DOCS_KEY)
}

export function getCarRegistry(): CarRecord[] {
  return readJSON<CarRecord[]>(CARS_KEY, SEED_CARS)
}

export function getCarsForPhone(phone: string): CarRecord[] {
  const operator = getOperator(phone)
  if (!operator) return []
  const registry = getCarRegistry()
  return operator.claimedCarIds
    .map((id) => registry.find((car) => car.id === id))
    .filter((car): car is CarRecord => Boolean(car))
}

export function verifyCarOwnership(
  phone: string,
  plateNumber: string,
  libre: string,
): { car: CarRecord | null; error?: string } {
  const registry = getCarRegistry()
  const plate = plateNumber.trim().toUpperCase()
  const libreId = libre.trim().toUpperCase()
  const car = registry.find(
    (item) => item.plateNumber.toUpperCase() === plate || item.libre.toUpperCase() === libreId,
  )
  if (!car) {
    return { car: null, error: "No vehicle found with these details in our registry." }
  }
  if (car.ownerPhone !== phone) {
    return {
      car: null,
      error: "This vehicle is registered to a different owner and can't be added.",
    }
  }
  const operators = getOperators()
  const operator = operators[phone]
  if (operator && !operator.claimedCarIds.includes(car.id)) {
    operators[phone] = { ...operator, claimedCarIds: [...operator.claimedCarIds, car.id] }
    saveOperators(operators)
  }
  return { car }
}

export function getSessionPhone(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setSessionPhone(phone: string) {
  localStorage.setItem(SESSION_KEY, phone)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}