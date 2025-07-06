import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: customer, error } = await supabase.from("customers").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }
      console.error("Error fetching customer:", error)
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}
