import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Phone, LockKeyhole } from "lucide-react"
import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inputClass, labelClass } from "@/lib/styles"
import { useAuth } from "@/lib/auth"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
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
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setError(null)
    try {
      register(trimmed, password)
      navigate("/verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <AuthShell
      title="Create your operator account"
      description="Register with your phone number to list vehicles."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="register-phone">
            Phone number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-phone"
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
          <label className={labelClass} htmlFor="register-password">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className={cn(inputClass, "pl-9")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="register-confirm">
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Repeat your password"
            className={inputClass}
          />
        </div>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already an operator?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}