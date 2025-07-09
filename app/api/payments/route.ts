import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json(payments || [])
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
    const { customer_name, amount } = body

    if (!customer_name || !amount) {
      return NextResponse.json({ error: "Missing required fields: customer_name, amount" }, { status: 400 })
    }

    // Insert the payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        customer_id: body.customer_id || null,
        customer_name,
        amount,
        transaction_id: body.transaction_id || null,
        payment_date: body.payment_date || new Date().toISOString(),
        order_id: body.order_id || null,
        payment_method: body.payment_method || null,
        status: body.status || "pending",
      })
      .select()
      .single()

    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
