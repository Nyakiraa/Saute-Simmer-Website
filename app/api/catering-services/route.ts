import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: cateringServices, error } = await supabase
      .from("catering_services")
      .select(`
        *,
        customers (
          name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching catering services:", error)
      return NextResponse.json({ error: "Failed to fetch catering services" }, { status: 500 })
    }

    return NextResponse.json(cateringServices)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch catering services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.customer_name || !body.event_type || !body.event_date || !body.guest_count || !body.location) {
      return NextResponse.json(
        { error: "Customer name, event type, event date, guest count, and location are required" },
        { status: 400 },
      )
    }

    const { data: cateringService, error } = await supabase.from("catering_services").insert([body]).select().single()

    if (error) {
      console.error("Error creating catering service:", error)
      return NextResponse.json({ error: "Failed to create catering service" }, { status: 500 })
    }

    return NextResponse.json(cateringService, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create catering service" }, { status: 500 })
  }
}
