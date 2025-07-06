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
        // No rows returned
        return NextResponse.json({ customer: null })
      }
      console.error("Error fetching customer:", error)
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error in customer lookup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json()

    if (!customerData.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("email", customerData.email)
      .single()

    if (existingCustomer) {
      return NextResponse.json({ customer: existingCustomer })
    }

    // Create new customer
    const { data: newCustomer, error } = await supabase.from("customers").insert([customerData]).select().single()

    if (error) {
      console.error("Error creating customer:", error)
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }

    return NextResponse.json({ customer: newCustomer })
  } catch (error) {
    console.error("Error in customer creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
