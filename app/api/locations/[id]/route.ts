import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const id = params.id

    const { data, error } = await supabase
      .from("locations")
      .update({
        address: body.address,
        date_of_service: body.date_of_service,
        start_time: body.start_time,
        end_time: body.end_time,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating location:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
