import { Link, Outlet, useNavigate } from "react-router-dom"
import { Bus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export function Brand() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight"
    >
      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
        <Bus className="size-4" />
      </span>
      kesefere <span className="text-muted-foreground">operator</span>
    </Link>
  )
}

export default function OperatorLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6">
          <Brand />
          <div className="flex shrink-0 items-center gap-3">
            {user && (
              <Link
                to="/cars"
                className="hidden max-w-44 truncate rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-block"
              >
                {user.phone}
              </Link>
            )}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  signOut()
                  navigate("/login")
                }}
              >
                <LogOut data-icon="inline-start" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}