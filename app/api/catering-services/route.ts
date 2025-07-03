import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("catering_services")
      .select("*")
      .order("event_date", { ascending: false })

    if (error) {
      console.error("Error fetching catering services:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("catering_services")
      .insert([
        {
          customer_id: body.customer_id,
          customer_name: body.customer_name,
          event_type: body.event_type,
          event_date: body.event_date,
          guest_count: body.guest_count,
          status: body.status,
          location: body.location,
          special_requests: body.special_requests,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating catering service:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
