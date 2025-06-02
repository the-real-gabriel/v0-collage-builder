import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, Trash2 } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function createNewProject(formData: FormData) {
  "use server"
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const title = (formData.get("title") as string) || `New Project ${new Date().toLocaleTimeString()}`

  const { data: newProject, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: title,
      grid_config: {
        // Default grid config
        rows: 2,
        columns: 2,
        width: 800,
        height: 600,
        gap: 10,
        cornerRadius: 0,
      },
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  if (newProject) {
    redirect(`/editor/${newProject.id}`)
  }
  return { success: true, project: newProject }
}

async function deleteProject(formData: FormData) {
  "use server"
  const supabase = getSupabaseServerClient()
  const projectId = formData.get("projectId") as string

  if (!projectId) return { error: "Project ID is required." }

  // First, delete associated images from storage and project_images table.
  // This requires more complex logic: list files in storage, delete them, then delete from table.
  // For now, we'll just delete the project record. Add storage cleanup later.
  // const { data: images, error: imagesError } = await supabase
  //   .from('project_images')
  //   .select('storage_path')
  //   .eq('project_id', projectId);

  // if (images && images.length > 0) {
  //   const filesToDelete = images.map(img => img.storage_path);
  //   await supabase.storage.from('project-files').remove(filesToDelete);
  //   await supabase.from('project_images').delete().eq('project_id', projectId);
  // }

  const { error } = await supabase.from("projects").delete().eq("id", projectId)
  if (error) {
    console.error("Error deleting project:", error)
    return { error: error.message }
  }
  revalidatePath("/dashboard")
  return { success: true }
}

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This should be caught by layout, but as a safeguard
    redirect("/login")
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    // Handle error display
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Collages</h1>
        <form action={createNewProject}>
          <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Collage
          </Button>
        </form>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  {project.description || "No description."} <br />
                  <span className="text-xs text-muted-foreground">
                    Last updated: {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for a small preview if available */}
                <div className="h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Preview
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="default" size="sm">
                  <Link href={`/editor/${project.id}`}>Open Editor</Link>
                </Button>
                <form action={deleteProject}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button variant="destructive" size="sm" type="submit">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No collages yet!</h2>
          <p className="text-muted-foreground mb-4">Get started by creating your first collage.</p>
          <form action={createNewProject}>
            <Button type="submit" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Collage
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
