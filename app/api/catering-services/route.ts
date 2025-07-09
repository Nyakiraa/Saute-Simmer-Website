import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: cateringServices, error } = await supabase
      .from("catering_services")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch catering services" }, { status: 500 })
    }

    return NextResponse.json(cateringServices || [])
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
    const { customer_name, event_type, event_date, guest_count, location } = body

    if (!customer_name || !event_type || !event_date || !guest_count || !location) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, event_type, event_date, guest_count, location" },
        { status: 400 },
      )
    }

    // Insert the catering service
    const { data: cateringService, error: cateringError } = await supabase
      .from("catering_services")
      .insert({
        customer_id: body.customer_id || 1,
        customer_name,
        event_type,
        event_date,
        guest_count: Number(guest_count),
        status: body.status || "pending",
        location,
        special_requests: body.special_requests || null,
        order_id: body.order_id || null,
        location_id: body.location_id || null,
        payment_method: body.payment_method || null,
      })
      .select()
      .single()

    if (cateringError) {
      console.error("Catering service creation error:", cateringError)
      return NextResponse.json({ error: "Failed to create catering service" }, { status: 500 })
    }

    return NextResponse.json(cateringService, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
