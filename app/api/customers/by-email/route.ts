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
      console.error("Error fetching customer:", error)
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error in customer lookup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabase = createServerClient()

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const customerData = await request.json()

    // Check if customer already exists
    const { data: existingCustomer } = await supabase.from("customers").select("*").eq("email", user.email).single()

    if (existingCustomer) {
      return NextResponse.json(existingCustomer)
    }

    // Create new customer record
    const newCustomerData = {
      email: user.email,
      name: customerData.name || user.user_metadata?.full_name || user.user_metadata?.name || "Unknown",
      phone: customerData.phone || "",
      address: customerData.address || "",
      created_at: new Date().toISOString(),
    }

    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert([newCustomerData])
      .select()
      .single()

    if (createError) {
      console.error("Error creating customer:", createError)
      return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 })
    }

    return NextResponse.json(newCustomer)
  } catch (error) {
    console.error("Error in customer creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
