// middleware.ts
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Instancia "liviana" de NextAuth solo para el middleware.
// IMPORTANTE: no debe importar nada de auth.ts (que trae bcrypt + mongodb,
// incompatibles con el Edge Runtime donde corre el middleware).
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ["/profile/:path*", "/login"],
}
