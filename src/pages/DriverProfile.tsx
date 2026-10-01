import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Check, ChevronDown, FileUp } from "lucide-react"
import {
  Building2,
  FileCheck2,
  FileSignature,
  IdCard,
  ScrollText,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { inputClass, selectClass, labelClass } from "@/lib/styles"
import { useAuth } from "@/lib/auth"
import { getSessionPhone, getOperator, getDriverDraft, saveDriverDraft, clearDriverDraft } from "@/lib/store"
import type { DriverDraft } from "@/lib/store"
import type { DriverProfile } from "@/lib/store"
import { BRANDS, COLORS, getProductionYears } from "@/data/vehicles"

const YEARS = getProductionYears()

const STEPS = ["Driver & business", "Vehicle", "Documents", "Summary"]

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Couldn't read the selected file."))
    reader.readAsDataURL(file)
  })
}

type DocumentKey =
  | "libre"
  | "employmentContract"
  | "insurance"
  | "driverLicense"
  | "businessLicense"
  | "businessRegistration"

function DocumentField({
  icon: Icon,
  label,
  hint,
  value,
  fileName,
  onFile,
  onRemove,
}: {
  icon: LucideIcon
  label: string
  hint: string
  value: string
  fileName?: string | null
  onFile: (file: File) => void
  onRemove: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const hasFile = Boolean(value)
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg border",
              hasFile
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
          {label}
        </CardTitle>
        <CardDescription>{hint}</CardDescription>
        <CardAction>
          {hasFile && (
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary"
            >
              <Check className="size-3" />
              Uploaded
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardFooter className="justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          {hasFile ? (
            <>
              <FileCheck2 className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">{fileName ?? `${label} uploaded`}</span>
            </>
          ) : (
            <>
              <FileUp className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm text-muted-foreground">No file selected</span>
            </>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {hasFile && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
          <Button
            type="button"
            variant={hasFile ? "outline" : "default"}
            size="sm"
            onClick={() => input.current?.click()}
          >
            <FileUp className="size-3.5" data-icon="inline-start" />
            {hasFile ? "Replace" : "Upload"}
          </Button>
        </span>
      </CardFooter>
      <input
        ref={input}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </Card>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

const DOCUMENT_ITEMS: { key: DocumentKey; label: string; icon: LucideIcon }[] = [
  { key: "libre", label: "Libre document", icon: FileCheck2 },
  { key: "employmentContract", label: "Employment contract", icon: FileSignature },
  { key: "insurance", label: "Insurance", icon: ShieldCheck },
  { key: "driverLicense", label: "Driver license", icon: IdCard },
  { key: "businessLicense", label: "Business license", icon: Building2 },
  { key: "businessRegistration", label: "Business registration", icon: ScrollText },
]

export default function DriverProfile() {
  const { user, saveProfile } = useAuth()
  const navigate = useNavigate()
  const phone = getSessionPhone()
  const operator = phone ? getOperator(phone) : null
  const draft = getDriverDraft()
  const [documents, setDocuments] = useState<Record<DocumentKey, string>>({
    libre: draft?.documents?.libre ?? operator?.profile?.vehicle.libreDocument ?? "",
    employmentContract: draft?.documents?.employmentContract ?? operator?.profile?.employmentContract ?? "",
    insurance: draft?.documents?.insurance ?? operator?.profile?.insuranceDocument ?? "",
    driverLicense: draft?.documents?.driverLicense ?? operator?.profile?.driverLicenseDocument ?? "",
    businessLicense: draft?.documents?.businessLicense ?? operator?.profile?.businessLicenseDocument ?? "",
    businessRegistration: draft?.documents?.businessRegistration ?? operator?.profile?.businessRegistrationDocument ?? "",
  })
  const [documentNames, setDocumentNames] = useState<Partial<Record<DocumentKey, string | null>>>(
    draft?.documentNames ?? {},
  )
  const [tinNumber, setTinNumber] = useState(draft?.tinNumber ?? operator?.profile?.tinNumber ?? "")
  const [ownsVehicle, setOwnsVehicle] = useState<boolean | null>(
    draft?.ownsVehicle ?? operator?.profile?.ownsVehicle ?? null,
  )
  const [brand, setBrand] = useState(draft?.brand ?? operator?.profile?.vehicle.brand ?? "")
  const [model, setModel] = useState(draft?.model ?? operator?.profile?.vehicle.model ?? "")
  const [plateNumber, setPlateNumber] = useState(draft?.plateNumber ?? operator?.profile?.vehicle.plateNumber ?? "")
  const [color, setColor] = useState(draft?.color ?? operator?.profile?.vehicle.color ?? "")
  const [productionYear, setProductionYear] = useState(
    draft?.productionYear ?? operator?.profile?.vehicle.productionYear?.toString() ?? "",
  )
  const [seat, setSeat] = useState(draft?.seat ?? operator?.profile?.vehicle.seat?.toString() ?? "")
  const [step, setStep] = useState(
    Math.min(Math.max(draft?.step ?? 0, 0), STEPS.length - 1),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const snapshot: DriverDraft = {
      step,
      tinNumber,
      ownsVehicle,
      brand,
      model,
      plateNumber,
      color,
      productionYear,
      seat,
      documents,
      documentNames,
    }
    saveDriverDraft(snapshot)
  }, [step, tinNumber, ownsVehicle, brand, model, plateNumber, color, productionYear, seat, documents, documentNames])

  if (!user) return <Navigate to="/login" replace />

  const modelOptions = BRANDS[brand] ?? []

  async function handleDocument(key: DocumentKey, file: File) {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setDocuments((current) => ({ ...current, [key]: dataUrl }))
      setDocumentNames((current) => ({ ...current, [key]: file.name }))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the document.")
    }
  }

  function handleRemoveDocument(key: DocumentKey) {
    setDocuments((current) => ({ ...current, [key]: "" }))
    setDocumentNames((current) => ({ ...current, [key]: null }))
  }

  function handleNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (step === 0 && ownsVehicle === null) {
      setError("Tell us whether you own the vehicle you operate.")
      return
    }
    if (step === 1) {
      if (brand.trim().length < 2 || model.trim().length < 1) {
        setError("Enter your vehicle's brand and model.")
        return
      }
      if (!plateNumber.trim()) {
        setError("Enter your vehicle's plate number.")
        return
      }
      const year = Number(productionYear)
      if (productionYear && (Number.isNaN(year) || year < 1980 || year > new Date().getFullYear() + 1)) {
        setError("Enter a valid production year.")
        return
      }
      const seats = Number(seat)
      if (!seat || Number.isNaN(seats) || seats < 1 || seats > 60) {
        setError("Enter a valid seat count.")
        return
      }
    }
    if (step === 2) {
      if (!documents.libre) {
        setError("Upload your vehicle's Libre document.")
        return
      }
      if (!ownsVehicle && !documents.employmentContract) {
        setError("Upload the employment contract from the vehicle's owner.")
        return
      }
    }
    setError(null)
    setStep((current) => current + 1)
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // if (step < STEPS.length - 1) {
    //   handleNext(event)
    //   return
    // }
    if (!documents.libre) {
      setError("Upload your vehicle's Libre document.")
      setStep(STEPS.length - 1)
      return
    }
    if (!ownsVehicle && !documents.employmentContract) {
      setError("Upload the employment contract from the vehicle's owner.")
      setStep(STEPS.length - 1)
      return
    }
    const year = Number(productionYear)
    const seats = Number(seat)
    setError(null)
    const profile: DriverProfile = {
      ...(operator?.profile),
      tinNumber: tinNumber.trim() || undefined,
      ownsVehicle: ownsVehicle ?? undefined,
      employmentContract: ownsVehicle ? undefined : documents.employmentContract || undefined,
      insuranceDocument: documents.insurance || undefined,
      driverLicenseDocument: documents.driverLicense || undefined,
      businessLicenseDocument: documents.businessLicense || undefined,
      businessRegistrationDocument: documents.businessRegistration || undefined,
      vehicle: {
        brand: brand.trim(),
        model: model.trim(),
        plateNumber: plateNumber.trim().toUpperCase(),
        color: color.trim() || undefined,
        productionYear: productionYear ? year : undefined,
        seat: seats,
        libreDocument: documents.libre || undefined,
      },
    }
    saveProfile(profile)
    clearDriverDraft()
    navigate("/cars")
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Complete your driver profile</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A few details about you, your vehicle, and the documents we need.
          </p>
        </div>

        <ol className="flex w-full items-start" aria-label="Profile progress">
          {STEPS.map((title, index) => {
            const current = step === index
            const done = step > index
            return (
              <li
                key={title}
                className={cn(
                  "flex min-w-0 flex-1 flex-col",
                  index === STEPS.length - 1 && "flex-none",
                )}
              >
                <div className="flex w-full items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (index < step) {
                        setError(null)
                        setStep(index)
                      }
                    }}
                    disabled={index > step}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "mx-3 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                      current
                        ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15"
                        : done
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : index + 1}
                  </button>
                  {index < STEPS.length - 1 && (
                    <span className={cn("h-px flex-1", done ? "bg-primary/60" : "bg-border")} />
                  )}
                </div>
                {/* <p
                  className={cn(
                    "mt-1.5 ml-3 w-8 text-center text-[11px] font-medium leading-tight sm:text-xs",
                    current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {title}
                </p> */}
              </li>
            )
          })}
        </ol>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="driver-tin">
                TIN number
              </label>
              <input
                id="driver-tin"
                type="text"
                value={tinNumber}
                onChange={(event) => setTinNumber(event.target.value)}
                placeholder="Enter your TIN number"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <span className={labelClass}>Are you the owner of this vehicle?</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Yes, I own it", value: true },
                  { label: "No, I'm under a contract", value: false },
                ].map((option) => {
                  const selected = ownsVehicle === option.value
                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setOwnsVehicle(option.value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-3 py-3 text-sm transition-colors",
                        selected
                          ? "border-primary/50 bg-primary/5 font-medium text-primary"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {option.label}
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40",
                        )}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                If you don't own the vehicle, an employment contract from the owner is required.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="vehicle-brand">
                  Brand
                </label>
                <div className="relative">
                  <select
                    id="vehicle-brand"
                    value={brand}
                    onChange={(event) => {
                      setBrand(event.target.value)
                      setModel("")
                    }}
                    className={cn(selectClass, "pr-8")}
                  >
                    <option value="" disabled>
                      Select brand
                    </option>
                    {Object.keys(BRANDS).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="vehicle-model">
                  Model
                </label>
                <div className="relative">
                  <select
                    id="vehicle-model"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    disabled={!brand}
                    className={cn(selectClass, "pr-8 disabled:opacity-50")}
                  >
                    <option value="" disabled>
                      Select model
                    </option>
                    {modelOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-plate">
                Plate number
              </label>
              <input
                id="vehicle-plate"
                type="text"
                value={plateNumber}
                onChange={(event) => setPlateNumber(event.target.value)}
                placeholder="3A 12345"
                className={cn(inputClass, "uppercase")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="vehicle-color">
                  Color
                </label>
                <div className="relative">
                  <select
                    id="vehicle-color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className={cn(selectClass, "pr-8")}
                  >
                    <option value="" disabled>
                      Select color
                    </option>
                    {COLORS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="vehicle-year">
                  Production year
                </label>
                <div className="relative">
                  <select
                    id="vehicle-year"
                    value={productionYear}
                    onChange={(event) => setProductionYear(event.target.value)}
                    className={cn(selectClass, "pr-8")}
                  >
                    <option value="" disabled>
                      Select year
                    </option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-seat">
                Number of seats
              </label>
              <input
                id="vehicle-seat"
                type="number"
                value={seat}
                onChange={(event) => setSeat(event.target.value)}
                placeholder="12"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <DocumentField
              icon={FileCheck2}
              label="Libre document"
              hint="Vehicle registration certificate."
              value={documents.libre}
              fileName={documentNames.libre}
              onFile={(file) => handleDocument("libre", file)}
              onRemove={() => handleRemoveDocument("libre")}
            />

            {ownsVehicle === false && (
              <DocumentField
                icon={FileSignature}
                label="Employment contract"
                hint="Signed by the vehicle's owner."
                value={documents.employmentContract}
                fileName={documentNames.employmentContract}
                onFile={(file) => handleDocument("employmentContract", file)}
                onRemove={() => handleRemoveDocument("employmentContract")}
              />
            )}

            <DocumentField
              icon={ShieldCheck}
              label="Insurance"
              hint="Valid insurance for the vehicle."
              value={documents.insurance}
              fileName={documentNames.insurance}
              onFile={(file) => handleDocument("insurance", file)}
              onRemove={() => handleRemoveDocument("insurance")}
            />
            <DocumentField
              icon={IdCard}
              label="Driver license"
              hint="Your valid driving license."
              value={documents.driverLicense}
              fileName={documentNames.driverLicense}
              onFile={(file) => handleDocument("driverLicense", file)}
              onRemove={() => handleRemoveDocument("driverLicense")}
            />
            <DocumentField
              icon={Building2}
              label="Business license"
              hint="Your operator's business license."
              value={documents.businessLicense}
              fileName={documentNames.businessLicense}
              onFile={(file) => handleDocument("businessLicense", file)}
              onRemove={() => handleRemoveDocument("businessLicense")}
            />
            <DocumentField
              icon={ScrollText}
              label="Business registration"
              hint="Certificate of business registration."
              value={documents.businessRegistration}
              fileName={documentNames.businessRegistration}
              onFile={(file) => handleDocument("businessRegistration", file)}
              onRemove={() => handleRemoveDocument("businessRegistration")}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Driver & business
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setError(null); setStep(0) }}>
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <SummaryRow label="Ownership" value={ownsVehicle ? "Vehicle owner" : "Contract driver"} />
                  <SummaryRow label="TIN number" value={tinNumber.trim() || "—"} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Vehicle
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setError(null); setStep(1) }}>
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <SummaryRow label="Brand & model" value={`${brand.trim()} ${model.trim()}`} />
                  <SummaryRow label="Plate number" value={plateNumber.trim().toUpperCase()} />
                  <SummaryRow label="Color" value={color.trim() || "—"} />
                  <SummaryRow label="Production year" value={productionYear || "—"} />
                  <SummaryRow label="Number of seats" value={seat} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Documents
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setError(null); setStep(2) }}>
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {DOCUMENT_ITEMS.filter(
                    (item) => item.key !== "employmentContract" || ownsVehicle === false,
                  ).map(({ key, label, icon: Icon }) => {
                    const hasFile = Boolean(documents[key])
                    return (
                      <li key={key} className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <Icon className={cn("size-4 shrink-0", hasFile ? "text-primary" : "text-muted-foreground")} />
                          <span className="truncate text-sm">{label}</span>
                        </span>
                        {hasFile ? (
                          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                            <Check className="size-3" />
                            Uploaded
                          </Badge>
                        ) : (
                          <Badge variant="outline">Missing</Badge>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null)
                setStep((current) => current - 1)
              }}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
              Continue
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto">
              Submit
            </Button>
          )}
        </div>
      </form>
    </AuthShell>
  )
}