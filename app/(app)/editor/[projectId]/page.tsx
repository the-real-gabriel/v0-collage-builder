import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Project, ProjectImage } from "@/lib/types"
import GridEditorComponent from "@/grid-editor" // Renamed to avoid conflict
import { redirect } from "next/navigation"

interface EditorPageProps {
  params: {
    projectId: string
  }
}

export default async function EditorPage({ params }: EditorPageProps) {
  const supabase = getSupabaseServerClient()
  const { projectId } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id) // Ensure user owns the project
    .single()

  if (projectError || !project) {
    console.error("Error fetching project or project not found:", projectError)
    redirect("/dashboard") // Or show a 404 page
  }

  const { data: images, error: imagesError } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)

  if (imagesError) {
    console.error("Error fetching project images:", imagesError)
    // Decide how to handle this, maybe load editor with no images
  }

  // TODO: Transform fetched `project` and `images` data into the initial state
  // expected by GridEditorComponent.
  // This includes converting storage_path to public URLs for images.
  // For now, passing them directly and GridEditorComponent will need adaptation.

  return (
    <div className="h-screen flex flex-col">
      {/* The GridEditorComponent will be rendered here.
          It will need to be adapted to:
          1. Accept initial project data (config, images).
          2. Save changes back to Supabase (project config, image details, new image uploads).
          3. Handle image uploads to Supabase Storage.
      */}
      <GridEditorComponent initialProject={project as Project} initialImages={(images || []) as ProjectImage[]} />
    </div>
  )
}
