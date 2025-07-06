import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { data: location, error } = await supabase.from("locations").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching location:", error)
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: location, error } = await supabase
      .from("locations")
      .update(body)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating location:", error)
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from("locations").delete().eq("id", params.id)

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
