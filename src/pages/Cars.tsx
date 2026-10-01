import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import { ArrowRight, BadgeCheck, Car, Palette, Plus, Ruler, ShieldQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inputClass, labelClass } from "@/lib/styles"
import { useAuth } from "@/lib/auth"
import {
  getCarsForPhone,
  getSessionPhone,
  verifyCarOwnership,
  type CarRecord,
} from "@/lib/store"

export default function Cars() {
  const { user } = useAuth()
  const phone = getSessionPhone()
  const [cars, setCars] = useState<CarRecord[]>(() => (phone ? getCarsForPhone(phone) : []))
  const [plateNumber, setPlateNumber] = useState("")
  const [libre, setLibre] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!user) return <Navigate to="/login" replace />

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    if (!phone) return
    if (!plateNumber.trim() || !libre.trim()) {
      setError("Enter both the plate number and Libre ID.")
      return
    }
    setError(null)
    const result = verifyCarOwnership(phone, plateNumber, libre)
    if (result.error) {
      setError(result.error)
      return
    }
    setCars(getCarsForPhone(phone))
    setPlateNumber("")
    setLibre("")
    setNotice(`${result.car?.brand} ${result.car?.model} verified and added to your account.`)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cars you operate, verified against the national vehicle registry.
          </p>
        </div>
        {user && !user?.profile && (
          <Button variant="outline" asChild>
            <Link to="/driver">
              Finish your driver details
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </div>

      {user?.profile && (
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Driver", value: user.profile.fullName ?? "—" },
            { label: "Vehicle", value: `${user.profile.vehicle.brand} ${user.profile.vehicle.model}` },
            { label: "Plate", value: user.profile.vehicle.plateNumber },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 truncate text-sm font-semibold">{value}</p>
            </div>
          ))}
        </section>
      )}

      {cars.length === 0 ? (
        <div className="mb-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Car className="size-7 text-muted-foreground" />
          <div>
            <p className="font-medium">No verified vehicles yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your vehicle below and we'll confirm you own it before it shows up here.
            </p>
          </div>
        </div>
      ) : (
        <section className="mb-8 grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Verified vehicles ({cars.length})
          </h2>
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Car className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{car.brand} {car.model}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {car.plateNumber} · Libre {car.libre}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {car.color && (
                      <span className="inline-flex items-center gap-1">
                        <Palette className="size-3" />
                        {car.color}
                      </span>
                    )}
                    {car.productionYear && (
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="size-3" />
                        {car.productionYear}
                      </span>
                    )}
                    <span>{car.seat} seats</span>
                  </div>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheck className="size-3.5" />
                Owner verified
              </span>
            </div>
          ))}
        </section>
      )}

      <section className="rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {error ? <ShieldQuestion className="size-4.5" /> : <Plus className="size-4.5" />}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold tracking-tight">Add a vehicle</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Enter the plate number and Libre ID. We check our national registry to confirm
              you're the owner before listing it.
            </p>
          </div>
        </div>
        <form onSubmit={handleVerify} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="car-plate">
              Plate number
            </label>
            <input
              id="car-plate"
              type="text"
              value={plateNumber}
              onChange={(event) => setPlateNumber(event.target.value)}
              placeholder="3A 12345"
              className={cn(inputClass, "uppercase")}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="car-libre">
              Libre ID
            </label>
            <input
              id="car-libre"
              type="text"
              value={libre}
              onChange={(event) => setLibre(event.target.value)}
              placeholder="AA 2021 12345"
              className={cn(inputClass, "uppercase")}
            />
          </div>
          <Button type="submit" className="sm:w-full">
            Verify ownership
          </Button>
        </form>
        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
            {notice}
          </p>
        )}
      </section>
    </div>
  )
}