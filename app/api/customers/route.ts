import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customers:", error)
      return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error in GET /api/customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: customer, error } = await supabase.from("customers").insert(body).select().single()

    if (error) {
      console.error("Error creating customer:", error)
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error in POST /api/customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
