import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  clearSession,
  getOperator,
  getSessionPhone,
  registerOperator,
  saveDriverProfile,
  setSessionPhone,
  signInOperator,
  verifyOperator,
  type DriverProfile,
} from "@/lib/store"

export interface OperatorUser {
  phone: string
  verified: boolean
  profile: DriverProfile | null
}

interface AuthContextValue {
  user: OperatorUser | null
  signIn: (phone: string, password: string) => void
  register: (phone: string, password: string) => void
  verifyOtp: (phone: string, otp: string) => boolean
  saveProfile: (profile: DriverProfile) => void
  signOut: () => void
}

function readUser(phone: string | null): OperatorUser | null {
  if (!phone) return null
  const operator = getOperator(phone)
  if (!operator) return null
  return { phone, verified: operator.verified, profile: operator.profile }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OperatorUser | null>(() => readUser(getSessionPhone()))

  const signIn = useCallback((phone: string, password: string) => {
    signInOperator(phone, password)
    setSessionPhone(phone)
    const operator = getOperator(phone)
    setUser({
      phone,
      verified: operator?.verified ?? false,
      profile: operator?.profile ?? null,
    })
  }, [])

  const register = useCallback((phone: string, password: string) => {
    registerOperator(phone, password)
    setSessionPhone(phone)
    setUser({ phone, verified: false, profile: null })
  }, [])

  const verifyOtp = useCallback((phone: string, otp: string) => {
    if (otp.trim() !== "123456") return false
    verifyOperator(phone)
    setUser((current) => (current?.phone === phone ? { ...current, verified: true } : current))
    return true
  }, [])

  const saveProfile = useCallback(
    (profile: DriverProfile) => {
      const phone = getSessionPhone()
      if (!phone) return
      saveDriverProfile(phone, profile)
      setUser((current) => (current ? { ...current, profile } : current))
    },
    [],
  )

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, signIn, register, verifyOtp, saveProfile, signOut }),
    [user, signIn, register, verifyOtp, saveProfile, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}