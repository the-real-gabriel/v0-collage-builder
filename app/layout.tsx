import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { AppHeader } from "@/components/layout/app-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Collage Builder",
  description: "Create beautiful photo collages",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppHeader />
          <main className="pt-16">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
