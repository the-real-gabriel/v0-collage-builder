"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, User, LogOut, Grid, Plus, Home, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Don't show the app header on the sign-in or sign-up pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null
  }

  // Check if we're in the collage editor
  const isInEditor = pathname?.includes("/collage-editor/") || pathname === "/new-collage"

  // If we're in the editor, don't show this header as the editor has its own
  if (isInEditor) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50 w-full shadow-subtle">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-medium typography-heading">Collage Builder</h1>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/5 text-black/60">Beta</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="flex items-center gap-2 btn-ghost h-8">
                  <Link href="/dashboard">
                    <Home className="h-3.5 w-3.5" />
                    <span>Dashboard</span>
                  </Link>
                </Button>

                <Button variant="outline" size="sm" asChild className="flex items-center gap-2 btn-subtle h-8">
                  <Link href="/new-collage">
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Collage</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 btn-ghost h-8">
                      <User className="h-3.5 w-3.5" />
                      <span>{user.email?.split("@")[0] || "Account"}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-3.5 w-3.5" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <Grid className="h-3.5 w-3.5" />
                        <span>My Collages</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="flex items-center gap-2 btn-ghost h-8">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild className="flex items-center gap-2 h-8">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn-ghost">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-gray-100">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start btn-ghost"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/dashboard">
                    <Home className="h-3.5 w-3.5 mr-2" />
                    Dashboard
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start btn-ghost"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/new-collage">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    New Collage
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start btn-ghost"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/profile">
                    <User className="h-3.5 w-3.5 mr-2" />
                    Profile
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start btn-ghost text-red-600"
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start btn-ghost"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start btn-ghost"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
