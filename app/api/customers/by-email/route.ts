import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: customers, error } = await supabase.from("customers").select("*").eq("email", email).limit(1)

    if (error) {
      console.error("Error finding customer:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (customers.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customers[0])
  } catch (error) {
    console.error("Error finding customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
