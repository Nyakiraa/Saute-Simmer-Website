import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        orders (
          id,
          total_amount,
          customers (
            name,
            email
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    // Transform the data to flatten the relationships
    const transformedPayments =
      payments?.map((payment) => ({
        ...payment,
        customer_name: payment.orders?.customers?.name || "Unknown Customer",
        customer_email: payment.orders?.customers?.email || "",
        order_total: payment.orders?.total_amount || 0,
      })) || []

    return NextResponse.json(transformedPayments)
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
    const { customer_id, amount, payment_method } = body

    if (!customer_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields: customer_id, amount, payment_method" },
        { status: 400 },
      )
    }

    // Insert the payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        customer_id,
        order_id: body.order_id || null,
        amount,
        payment_method,
        status: body.status || "pending",
        payment_date: body.payment_date || new Date().toISOString().split("T")[0],
        notes: body.notes || null,
      })
      .select(`
        *,
        orders (
          id,
          total_amount,
          customers (
            name,
            email
          )
        )
      `)
      .single()

    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }

    // Transform the response
    const transformedPayment = {
      ...payment,
      customer_name: payment.orders?.customers?.name || "Unknown Customer",
      customer_email: payment.orders?.customers?.email || "",
      order_total: payment.orders?.total_amount || 0,
    }

    return NextResponse.json(transformedPayment, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
