import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { AuthProvider, useAuth } from "@/lib/auth"
import OperatorLayout from "@/components/Layout"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import VerifyOtp from "@/pages/VerifyOtp"
import DriverProfile from "@/pages/DriverProfile"
import Cars from "@/pages/Cars"

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!user.verified) return <Navigate to="/verify" replace />
  if (!user.profile) return <Navigate to="/driver" replace />
  return <Navigate to="/cars" replace />
}

const router = createBrowserRouter([
  { path: "/", element: <HomeRedirect /> },
  {
    element: <OperatorLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify", element: <VerifyOtp /> },
      { path: "driver", element: <DriverProfile /> },
      { path: "cars", element: <Cars /> },
    ],
  },
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App