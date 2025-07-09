import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
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
    const supabase = createServerClient()

    console.log("Creating order with data:", body)

    // First, try to find or create customer
    let customerId = null
    if (body.customer_email) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", body.customer_email)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else if (body.customer_name && body.customer_email) {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: body.customer_name,
            email: body.customer_email,
            phone: body.contact_number || "",
            address: body.delivery_address || "",
          })
          .select("id")
          .single()

        if (!customerError && newCustomer) {
          customerId = newCustomer.id
        }
      }
    }

    // Create location record for delivery address
    let locationId = null
    if (body.delivery_address) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .insert({
          name: `${body.customer_name}'s Location`,
          address: body.delivery_address,
          phone: body.contact_number || body.phone || "Not provided",
          status: "active",
          country: "Philippines",
        })
        .select("id")
        .single()

      if (!locationError && location) {
        locationId = location.id
        console.log("Created location with ID:", locationId)
      } else {
        console.error("Error creating location:", locationError)
      }
    }

    // Prepare order data
    const orderData = {
      customer_id: customerId,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      order_type: body.order_type || "meal_set",
      meal_set_id: body.meal_set_id,
      meal_set_name: body.meal_set_name,
      items: body.items || [],
      quantity: body.quantity || 1,
      total_amount: body.total_amount,
      event_type: body.event_type,
      event_date: body.event_date,
      delivery_date: body.delivery_date || body.event_date,
      delivery_address: body.delivery_address,
      contact_person: body.contact_person,
      contact_number: body.contact_number,
      payment_method: body.payment_method,
      special_requests: body.special_requests,
      special_instructions: body.special_instructions || body.special_requests,
      status: "pending",
      order_date: body.order_date || new Date().toISOString().split("T")[0],
    }

    console.log("Inserting order:", orderData)

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError }, { status: 500 })
    }

    console.log("Order created successfully:", order)

    // Create catering service record if this is an event order
    if (body.event_type && body.event_date && order) {
      const cateringData = {
        customer_id: customerId || 1,
        customer_name: body.customer_name,
        event_type: body.event_type,
        event_date: body.event_date,
        guest_count: body.quantity || 1,
        location: body.delivery_address,
        location_id: locationId,
        order_id: order.id,
        payment_method: body.payment_method,
        special_requests: body.special_requests,
        status: "pending",
      }

      const { error: cateringError } = await supabase.from("catering_services").insert(cateringData)

      if (cateringError) {
        console.error("Error creating catering service:", cateringError)
        // Don't fail the order creation if catering service creation fails
      } else {
        console.log("Catering service created successfully")
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
