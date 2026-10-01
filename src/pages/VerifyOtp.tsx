import { useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { getSessionPhone, MOCK_OTP } from "@/lib/store"

const INPUT_CLASS =
  "size-11 rounded-lg border border-border bg-background text-center text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"

export default function VerifyOtp() {
  const { verifyOtp } = useAuth()
  const navigate = useNavigate()
  const phone = getSessionPhone() ?? ""
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  if (!phone) {
    return <Navigate to="/login" replace />
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError(null)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handleSubmit() {
    const code = otp.join("")
    if (code.length !== 6) {
      setError("Enter the 6-digit code sent to your phone.")
      return
    }
    if (verifyOtp(phone, code)) {
      navigate("/driver")
    } else {
      setOtp(Array(6).fill(""))
      inputs.current[0]?.focus()
      setError("That code didn't match. Try again.")
    }
  }

  return (
    <AuthShell
      title="Confirm your phone number"
      description={`Enter the 6-digit code we sent to ${phone}.`}
    >
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el
              }}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              inputMode="numeric"
              autoFocus={index === 0}
              aria-label={`OTP digit ${index + 1}`}
              className={INPUT_CLASS}
            />
          ))}
        </div>
        <p className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          <ShieldCheck className="size-3.5" />
          Demo environment — use code <span className="font-mono font-semibold">{MOCK_OTP}</span>
        </p>
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button className="w-full" onClick={handleSubmit}>
          Verify number
        </Button>
      </div>
    </AuthShell>
  )
}