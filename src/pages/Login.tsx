import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Phone, LockKeyhole } from "lucide-react"
import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inputClass, labelClass } from "@/lib/styles"
import { useAuth } from "@/lib/auth"
import { getOperator } from "@/lib/store"

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = phone.trim()
    if (!/^\+?[0-9\s-]{9,15}$/.test(trimmed)) {
      setError("Enter a valid phone number.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setError(null)
    try {
      signIn(trimmed, password)
      const operator = getOperator(trimmed)
      if (operator && !operator.verified) navigate("/verify")
      else if (operator && !operator.profile) navigate("/driver")
      else navigate("/cars")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to manage your vehicles.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="login-phone">
            Phone number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="09 11 22 33 44"
              className={cn(inputClass, "pl-9")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className={cn(inputClass, "pl-9")}
            />
          </div>
        </div>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New operator?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}