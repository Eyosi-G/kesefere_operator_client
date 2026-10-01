import type { ReactNode } from "react"
import { BadgeCheck, Bus, FileCheck2, KeyRound } from "lucide-react"

const PILLARS = [
  { icon: KeyRound, title: "Phone verified", text: "Confirm your number with a one-time code." },
  { icon: BadgeCheck, title: "Ownership proof", text: "Vehicles are matched to their owner." },
  { icon: FileCheck2, title: "Libre on file", text: "Registration documents uploaded safely." },
]

export default function AuthShell({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-start gap-y-8 px-6 py-10 lg:grid-cols-2 lg:gap-x-12">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-background to-background p-6 lg:px-10 lg:pb-10 lg:pt-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-primary/10 blur-3xl" />
        {/* <Radio className="pointer-events-none absolute right-8 top-10 size-48 rotate-12 text-primary/20" /> */}
        <div className="relative">
          <h2 className="max-w-sm text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">
            Run your vehicles on kesefere.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Register once, confirm your phone, add your driver details, and list the vehicles
            you own. Passengers book seats the moment you're live.
          </p>

          <ul className="mt-8 grid gap-3">
            {PILLARS.map(({ icon: Icon, title: pillarTitle, text }) => (
              <li
                key={pillarTitle}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3 backdrop-blur"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{pillarTitle}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl lg:mx-0">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8">
          {title && (
            <>
              <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25 lg:hidden">
                  <Bus className="size-4" />
                </span>
                {title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </>
          )}
          <div className={title ? "mt-6" : undefined}>{children}</div>
        </div>
      </div>
    </div>
  )
}