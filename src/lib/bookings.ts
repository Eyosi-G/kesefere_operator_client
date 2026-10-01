export type BookingStatus = "active" | "canceled"

export interface Booking {
  id: string
  serviceId: string
  name: string
  phone: string
  createdAt: string
  status: BookingStatus
}

const SEED: Booking[] = [
  {
    id: "seed-4kilo-bole",
    serviceId: "4kilo-bole-morning",
    name: "Abebe Kebede",
    phone: "09 11 22 33 44",
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "seed-megenagna-bole",
    serviceId: "megenagna-bole",
    name: "Hiwat Tesfaye",
    phone: "09 55 66 77 88",
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "seed-mekanisa-bole",
    serviceId: "mekanisa-bole-morning",
    name: "Sara Bekele",
    phone: "09 33 44 55 66",
    createdAt: new Date().toISOString(),
    status: "active",
  },
]

let bookings: Booking[] = [...SEED]

export function getBookings(): Booking[] {
  return bookings
}

export function addBooking(
  input: Omit<Booking, "id" | "createdAt" | "status">,
): Booking {
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "active",
  }
  bookings = [booking, ...bookings]
  return booking
}

export function cancelBooking(id: string) {
  bookings = bookings.map((booking) =>
    booking.id === id ? { ...booking, status: "canceled" } : booking,
  )
}