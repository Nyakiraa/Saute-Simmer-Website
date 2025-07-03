import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: locations, error } = await supabase
      .from("locations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching locations:", error)
      return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
    }

    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: location, error } = await supabase.from("locations").insert([body]).select().single()

    if (error) {
      console.error("Error creating location:", error)
      return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
    }

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}
