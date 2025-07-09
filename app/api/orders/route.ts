import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        payments (
          id,
          amount,
          payment_method,
          status
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error("Error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received order data:", body)

    // Start a transaction-like approach
    let customerId = body.customer_id

    // If no customer_id provided, create or find customer
    if (!customerId && body.customer_email) {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", body.customer_email)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert([
            {
              name: body.customer_name || "Guest Customer",
              email: body.customer_email,
              phone: body.customer_phone || "",
            },
          ])
          .select("id")
          .single()

        if (customerError) {
          console.error("Error creating customer:", customerError)
          return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
        }

        customerId = newCustomer.id
      }
    }

    // Create the order
    const orderData = {
      customer_id: customerId,
      total_amount: body.total_amount || 0,
      order_type: body.order_type || "delivery",
      delivery_address: body.delivery_address || null,
      delivery_date: body.delivery_date || null,
      delivery_time: body.delivery_time || null,
      special_instructions: body.special_instructions || null,
      location_id: body.location_id || null,
      status: "pending",
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create payment record if payment info provided
    if (body.payment_method && body.total_amount > 0) {
      const paymentData = {
        order_id: order.id,
        amount: body.total_amount,
        payment_method: body.payment_method,
        status: "pending",
      }

      const { error: paymentError } = await supabase.from("payments").insert([paymentData])

      if (paymentError) {
        console.error("Error creating payment:", paymentError)
        // Don't fail the order creation, just log the error
      }
    }

    // Create catering service record if it's a catering order
    if (body.order_type === "catering" && body.event_details) {
      const cateringData = {
        customer_name: body.customer_name || "Guest Customer",
        event_type: body.event_details.event_type || "Event",
        event_date: body.event_details.event_date || body.delivery_date,
        guest_count: body.event_details.guest_count || 1,
        status: "pending",
        location: body.event_details.location || body.delivery_address || "TBD",
      }

      const { error: cateringError } = await supabase.from("catering_services").insert([cateringData])

      if (cateringError) {
        console.error("Error creating catering service:", cateringError)
        // Don't fail the order creation, just log the error
      }
    }

    // Fetch the complete order with relationships
    const { data: completeOrder, error: fetchError } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        payments (
          id,
          amount,
          payment_method,
          status
        )
      `)
      .eq("id", order.id)
      .single()

    if (fetchError) {
      console.error("Error fetching complete order:", fetchError)
      return NextResponse.json(order, { status: 201 }) // Return basic order if fetch fails
    }

    return NextResponse.json(completeOrder, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
