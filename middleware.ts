import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  // Incluye /login para que el callback pueda redirigir usuarios ya autenticados
  matcher: ["/profile/:path*", "/login"],
}
