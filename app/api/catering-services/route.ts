import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: cateringServices, error } = await supabase
      .from("catering_services")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching catering services:", error)
      return NextResponse.json({ error: "Failed to fetch catering services" }, { status: 500 })
    }

    return NextResponse.json(cateringServices)
  } catch (error) {
    console.error("Error in GET /api/catering-services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: cateringService, error } = await supabase.from("catering_services").insert(body).select().single()

    if (error) {
      console.error("Error creating catering service:", error)
      return NextResponse.json({ error: "Failed to create catering service" }, { status: 500 })
    }

    return NextResponse.json(cateringService)
  } catch (error) {
    console.error("Error in POST /api/catering-services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
