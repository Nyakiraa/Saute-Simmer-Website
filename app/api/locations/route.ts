import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: locations, error } = await supabase.from("locations").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
    }

    return NextResponse.json(locations || [])
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Validate required fields
    const { name, address, city } = body

    if (!name || !address || !city) {
      return NextResponse.json({ error: "Missing required fields: name, address, city" }, { status: 400 })
    }

    // Insert the location
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .insert({
        name,
        address,
        city,
        phone: body.phone || null,
        status: body.status || "active",
        state: body.state || null,
        zip_code: body.zip_code || null,
        country: body.country || "Philippines",
      })
      .select()
      .single()

    if (locationError) {
      console.error("Location creation error:", locationError)
      return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
    }

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
