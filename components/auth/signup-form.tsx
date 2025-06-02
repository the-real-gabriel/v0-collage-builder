"use client"

import { useFormState, useFormStatus } from "react-dom"
import { signUpWithEmail } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast" // Assuming use-toast is available

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing Up..." : "Sign Up"}
    </Button>
  )
}

export function SignupForm() {
  const [state, formAction] = useFormState(signUpWithEmail, null)

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Signup Successful",
        description: state.message,
      })
      // Optionally redirect or clear form here
    } else if (state?.message && !state.errors) {
      toast({
        title: "Signup Error",
        description: state.message,
        variant: "destructive",
      })
    }
  }, [state])

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create an account to start building collages.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state?.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && <p className="text-xs text-red-500">{state.errors.password[0]}</p>}
          </div>
          {state?.message && !state.errors && !state.success && <p className="text-sm text-red-500">{state.message}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-xs text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
