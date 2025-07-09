import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: locations, error } = await supabase.from("locations").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching locations:", error)
      return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
    }

    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error in GET /api/locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json({ error: "Missing required fields: name, address" }, { status: 400 })
    }

    const locationData = {
      name: body.name,
      address: body.address,
      phone: body.phone || null,
      status: body.status || "active",
      state: body.state || null,
      zip_code: body.zip_code || null,
      country: body.country || "Philippines",
    }

    const { data: location, error } = await supabase.from("locations").insert(locationData).select().single()

    if (error) {
      console.error("Error creating location:", error)
      return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error in POST /api/locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
