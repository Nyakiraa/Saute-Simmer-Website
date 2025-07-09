import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: location, error } = await supabase.from("locations").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching location:", error)
      return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
    }

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error in GET /api/locations/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const locationData = {
      name: body.name,
      address: body.address,
      phone: body.phone,
      status: body.status,
      state: body.state,
      zip_code: body.zip_code,
      country: body.country,
    }

    const { data: location, error } = await supabase
      .from("locations")
      .update(locationData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating location:", error)
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error in PUT /api/locations/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("locations").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting location:", error)
      return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/locations/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
