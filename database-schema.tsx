"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DatabaseSchema() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Collage Builder Database Schema</h1>

      <Tabs defaultValue="schema">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schema">Schema Diagram</TabsTrigger>
          <TabsTrigger value="tables">Table Definitions</TabsTrigger>
          <TabsTrigger value="policies">RLS Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="schema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity Relationship Diagram</CardTitle>
              <CardDescription>Visual representation of the database schema and relationships</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto">
              <div className="border p-4 rounded-lg bg-gray-50">
                <pre className="text-xs overflow-auto">
                  {`
┌─────────────────┐       ┌─────────────────┐
│     users       │       │    collages     │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ email           │       │ user_id         │◄─────┐
│ created_at      │       │ name            │      │
└────────┬────────┘       │ description     │      │
         │                │ rows            │      │
         │                │ columns         │      │
         │                │ grid_width      │      │
         │                │ grid_height     │      │
         │                │ cell_size       │      │
         │                │ grid_gap        │      │
         │                │ corner_radius   │      │
         │                │ is_public       │      │
         │                │ created_at      │      │
         │                │ updated_at      │      │
         │                └────────┬────────┘      │
         │                         │               │
         │                         │               │
         │                         ▼               │
         │                ┌─────────────────┐      │
         │                │      boxes      │      │
         │                ├─────────────────┤      │
         │                │ id              │      │
         │                │ collage_id      │◄─────┘
         │                │ position        │
         │                │ row_span        │
         │                │ col_span        │
         │                │ content         │
         │                │ image_url       │
         │                │ color           │
         │                │ created_at      │
         │                │ updated_at      │
         │                └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│   tray_images   │
├─────────────────┤
│ id              │
│ user_id         │◄─────┘
│ url             │
│ in_use          │
│ content         │
│ created_at      │
│ updated_at      │
└─────────────────┘
                  `}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>users</CardTitle>
                <CardDescription>Managed by Supabase Auth</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code>id</code> - UUID (primary key)
                  </li>
                  <li>
                    <code>email</code> - TEXT
                  </li>
                  <li>
                    <code>created_at</code> - TIMESTAMP
                  </li>
                  <li>... other auth fields</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>collages</CardTitle>
                <CardDescription>Main projects created by users</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code>id</code> - UUID (primary key)
                  </li>
                  <li>
                    <code>user_id</code> - UUID (foreign key to users.id)
                  </li>
                  <li>
                    <code>name</code> - TEXT
                  </li>
                  <li>
                    <code>description</code> - TEXT
                  </li>
                  <li>
                    <code>rows</code> - INTEGER
                  </li>
                  <li>
                    <code>columns</code> - INTEGER
                  </li>
                  <li>
                    <code>grid_width</code> - INTEGER
                  </li>
                  <li>
                    <code>grid_height</code> - INTEGER
                  </li>
                  <li>
                    <code>cell_size</code> - INTEGER
                  </li>
                  <li>
                    <code>grid_gap</code> - INTEGER
                  </li>
                  <li>
                    <code>corner_radius</code> - INTEGER
                  </li>
                  <li>
                    <code>is_public</code> - BOOLEAN
                  </li>
                  <li>
                    <code>created_at</code> - TIMESTAMP
                  </li>
                  <li>
                    <code>updated_at</code> - TIMESTAMP
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>boxes</CardTitle>
                <CardDescription>Elements within a collage</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code>id</code> - UUID (primary key)
                  </li>
                  <li>
                    <code>collage_id</code> - UUID (foreign key to collages.id)
                  </li>
                  <li>
                    <code>position</code> - INTEGER
                  </li>
                  <li>
                    <code>row_span</code> - INTEGER
                  </li>
                  <li>
                    <code>col_span</code> - INTEGER
                  </li>
                  <li>
                    <code>content</code> - TEXT
                  </li>
                  <li>
                    <code>image_url</code> - TEXT
                  </li>
                  <li>
                    <code>color</code> - TEXT
                  </li>
                  <li>
                    <code>created_at</code> - TIMESTAMP
                  </li>
                  <li>
                    <code>updated_at</code> - TIMESTAMP
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>tray_images</CardTitle>
                <CardDescription>Images available for use in collages</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code>id</code> - UUID (primary key)
                  </li>
                  <li>
                    <code>user_id</code> - UUID (foreign key to users.id)
                  </li>
                  <li>
                    <code>url</code> - TEXT
                  </li>
                  <li>
                    <code>in_use</code> - BOOLEAN
                  </li>
                  <li>
                    <code>content</code> - TEXT
                  </li>
                  <li>
                    <code>created_at</code> - TIMESTAMP
                  </li>
                  <li>
                    <code>updated_at</code> - TIMESTAMP
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Row Level Security Policies</CardTitle>
              <CardDescription>Security policies to control access to data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">collages table</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Users can view their own collages</li>
                    <li>Users can insert their own collages</li>
                    <li>Users can update their own collages</li>
                    <li>Users can delete their own collages</li>
                    <li>Anyone can view public collages</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">boxes table</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Users can view boxes in their collages</li>
                    <li>Users can insert boxes in their collages</li>
                    <li>Users can update boxes in their collages</li>
                    <li>Users can delete boxes in their collages</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">tray_images table</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Users can view their own tray images</li>
                    <li>Users can insert their own tray images</li>
                    <li>Users can update their own tray images</li>
                    <li>Users can delete their own tray images</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
