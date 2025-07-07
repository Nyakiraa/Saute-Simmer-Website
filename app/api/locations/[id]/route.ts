import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: location, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", Number.parseInt(id))
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Location not found" }, { status: 404 })
      }
      console.error("Error fetching location:", error)
      return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: location, error } = await supabase
      .from("locations")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Location not found" }, { status: 404 })
      }
      console.error("Error updating location:", error)
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("locations").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting location:", error)
      return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
    }

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
