"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

export default function ProfilePage() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/sign-in")
      return
    }

    async function loadProfile() {
      try {
        setIsLoading(true)

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setProfile(data)
          setUsername(data.username || "")
          setDisplayName(data.display_name || "")
        } else {
          // Create a new profile if it doesn't exist
          const newProfile = {
            id: user.id,
            username: user.email?.split("@")[0] || "",
            display_name: user.email?.split("@")[0] || "",
            avatar_url: null,
          }

          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single()

          if (createError) throw createError

          setProfile(createdProfile)
          setUsername(createdProfile.username || "")
          setDisplayName(createdProfile.display_name || "")
        }
      } catch (err) {
        console.error("Error loading profile:", err)
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsSaving(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            >
              Back to Dashboard
            </button>

            <div className="space-x-2">
              <button type="button" onClick={signOut} className="px-4 py-2 bg-red-500 text-white rounded">
                Sign Out
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
