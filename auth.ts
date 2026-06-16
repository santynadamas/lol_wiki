//auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { getDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { authConfig } from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const db = await getDb()
        const user = await db.collection("users").findOne({
          username: credentials.username,
        })
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!ok) return null
        return {
          id: user._id.toString(),
          name: user.profile.displayName,
          // Guardamos el username real para poder buscarlo luego
          email: user.email || user.username,
          // Campo extra para identificar el username en el JWT
          username: user.username as string,
        }
      },
    }),
  ],
  callbacks: {
    // Persiste datos extra en el JWT
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // Para credentials, guardamos el username
        if ((user as any).username) {
          token.username = (user as any).username
        }
        // Para Google, auto-registrar el usuario si no existe
        if (account?.provider === "google" && user.email) {
          const db = await getDb()
          const existing = await db.collection("users").findOne({ email: user.email })
          if (!existing) {
            const now = new Date().toISOString()
            const newUser = {
              username: user.email.split("@")[0],
              email: user.email,
              passwordHash: "",
              profile: {
                displayName: user.name ?? user.email.split("@")[0],
                bio: "",
                avatar: user.image ?? "",
                favoriteRole: "Fill",
                favoriteChampion: "",
                region: "LAS",
              },
              riotAccount: { gameName: "", tagLine: "", puuid: null, linked: false },
              favorites: { champions: [], skins: [], items: [] },
              settings: { theme: "dark", language: "es", notifications: true },
              stats: { buildsCreated: 0, likesReceived: 0 },
              roles: ["user"],
              isVerified: true,
              isBanned: false,
              lastLogin: now,
              createdAt: now,
              updatedAt: now,
            }
            await db.collection("users").insertOne(newUser)
          } else {
            // Actualizar último login
            await db.collection("users").updateOne(
              { email: user.email },
              { $set: { lastLogin: new Date().toISOString() } }
            )
          }
        }
      }
      return token
    },
    // Expone los datos extra en la sesión
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).username = token.username
      }
      return session
    },
  },
})
