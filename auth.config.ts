// auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = nextUrl.pathname.startsWith("/profile")
      const isOnLogin = nextUrl.pathname.startsWith("/login")

      // Ya logueado intentando entrar a /login → redirigir a /profile
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/profile", nextUrl))
      }

      // Ruta protegida sin sesión → redirige a /login (automático con pages.signIn)
      if (isProtected && !isLoggedIn) {
        return false
      }

      // Todo lo demás: permitir
      return true
    },
  },
} satisfies NextAuthConfig
