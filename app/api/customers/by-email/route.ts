import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Looking for customer with email:", email)

    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, address")
      .eq("email", email)
      .single()

    if (error) {
      console.log("Customer not found:", error.message)
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    console.log("Customer found:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error finding customer by email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
