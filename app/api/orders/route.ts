import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received order data:", body)

    // Validate required fields
    if (!body.customer_name || !body.total_amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name and total_amount are required" },
        { status: 400 },
      )
    }

    // Create or get customer
    let customerId = null
    if (body.customer_email) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", body.customer_email)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: body.customer_name,
            email: body.customer_email,
            phone: body.contact_number || body.phone || "",
            address: body.delivery_address || "",
          })
          .select("id")
          .single()

        if (customerError) {
          console.error("Error creating customer:", customerError)
        } else {
          customerId = newCustomer?.id
        }
      }
    }

    // Create location if delivery address is provided
    let locationId = null
    if (body.delivery_address) {
      const { data: newLocation, error: locationError } = await supabase
        .from("locations")
        .insert({
          name: `${body.customer_name}'s Location`,
          address: body.delivery_address,
          phone: body.contact_number || body.phone || "Not provided",
          status: "active",
        })
        .select("id")
        .single()

      if (locationError) {
        console.error("Error creating location:", locationError)
      } else {
        locationId = newLocation?.id
        console.log("Created location with phone:", body.contact_number || body.phone || "Not provided")
      }
    }

    // Prepare order data
    const orderData = {
      customer_id: customerId,
      customer_name: body.customer_name,
      customer_email: body.customer_email || null,
      contact_number: body.contact_number || body.phone || null,
      contact_person: body.contact_person || body.customer_name,
      delivery_address: body.delivery_address || null,
      payment_method: body.payment_method || null,
      special_requests: body.special_requests || null,
      special_instructions: body.special_instructions || body.special_requests || null,
      total_amount: Number(body.total_amount),
      order_type: body.order_type || "meal_set",
      meal_set_id: body.meal_set_id || null,
      meal_set_name: body.meal_set_name || null,
      quantity: Number(body.quantity) || 1,
      order_date: body.order_date || new Date().toISOString().split("T")[0],
      event_type: body.event_type || null,
      event_date: body.event_date || null,
      delivery_date: body.delivery_date || body.event_date || null,
      items: body.items ? JSON.stringify(body.items) : "[]",
      status: "pending",
    }

    console.log("Creating order with data:", orderData)

    // Create order
    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create catering service if event details are provided
    if (body.event_type && body.event_date && order) {
      const cateringData = {
        customer_id: customerId || 1,
        customer_name: body.customer_name,
        event_type: body.event_type,
        event_date: body.event_date,
        guest_count: Number(body.guest_count) || Number(body.quantity) || 1,
        location: body.delivery_address || "Not specified",
        location_id: locationId,
        order_id: order.id,
        payment_method: body.payment_method || null,
        special_requests: body.special_requests || null,
        status: "pending",
      }

      const { error: cateringError } = await supabase.from("catering_services").insert(cateringData)

      if (cateringError) {
        console.error("Error creating catering service:", cateringError)
      }
    }

    console.log("Order created successfully:", order)
    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
