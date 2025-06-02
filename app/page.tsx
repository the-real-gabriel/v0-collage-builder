import { ProtectedRoute } from "@/components/auth/protected-route"
import GridEditor from "@/grid-editor"

export default function Home() {
  return (
    <ProtectedRoute>
      <GridEditor />
    </ProtectedRoute>
  )
}
