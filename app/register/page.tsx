"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)

    const res = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid username or password")
    } else {
      router.push("/")
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          background: "rgba(13,17,23,.9)",
          border: "1px solid rgba(200,160,50,.2)",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 380,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#c8a032",
            marginBottom: 24,
          }}
        >
          Sign Up
        </div>

        {/* Google Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "11px",
            borderRadius: 8,
            marginBottom: 20,
            cursor: "pointer",
            background: "#fff",
            color: "#1a1a1a",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(255,255,255,.1)",
            }}
          />
          <span style={{ fontSize: 12, color: "#6e7681" }}>
            or use your account
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(255,255,255,.1)",
            }}
          />
        </div>

        {/* Username / Password Form */}
        {error && (
          <div
            style={{
              background: "rgba(255,107,107,.1)",
              border: "1px solid #ff6b6b",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#ff6b6b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            name="username"
            placeholder="Username"
            required
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#e8eaed",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#e8eaed",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />

          <button
            type="submit"
            style={{
              background: "#c8a032",
              color: "#0a0a0f",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        {/* Register Link */}
        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 13,
            color: "#6e7681",
          }}
        >
          You have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#c8a032",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
