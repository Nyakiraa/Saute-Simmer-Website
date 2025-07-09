import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const locationId = params.id

    const { data: location, error } = await supabase
      .from("locations")
      .update({
        name: body.name,
        address: body.address,
        phone: body.phone,
        status: body.status,
        state: body.state,
        zip_code: body.zip_code,
        country: body.country,
      })
      .eq("id", locationId)
      .select()
      .single()

    if (error) {
      console.error("Error updating location:", error)
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
    }

    return NextResponse.json({ success: true, location })
  } catch (error) {
    console.error("Error in PUT /api/locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const locationId = params.id

    const { error } = await supabase.from("locations").delete().eq("id", locationId)

    if (error) {
      console.error("Error deleting location:", error)
      return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
