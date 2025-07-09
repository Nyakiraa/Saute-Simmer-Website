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
    console.log("Order request body:", body)

    // Create location record first if delivery address is provided
    let locationId = null
    if (body.delivery_address) {
      const locationData = {
        name: `${body.customer_name}'s Location`,
        address: body.delivery_address,
        phone: body.contact_number || body.phone || "",
        status: "active",
        country: "Philippines",
      }

      const { data: locationResult, error: locationError } = await supabase
        .from("locations")
        .insert([locationData])
        .select()
        .single()

      if (locationError) {
        console.error("Error creating location:", locationError)
        return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
      }

      locationId = locationResult.id
      console.log("Created location with ID:", locationId)
    }

    // Prepare order data
    const orderData = {
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      items: body.items || [],
      total_amount: body.total_amount,
      status: body.status || "pending",
      order_date: body.order_date || new Date().toISOString(),
      delivery_date: body.delivery_date,
      delivery_address: body.delivery_address,
      special_instructions: body.special_instructions,
      payment_method: body.payment_method,
      order_type: body.order_type || "meal_set",
      meal_set_id: body.meal_set_id,
      meal_set_name: body.meal_set_name,
      event_type: body.event_type,
      event_date: body.event_date,
      contact_person: body.contact_person || body.customer_name,
      contact_number: body.contact_number || body.phone,
      special_requests: body.special_requests || body.special_instructions,
      quantity: body.quantity || 1,
      location_id: locationId,
    }

    // Create the order
    const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    console.log("Created order:", order)

    // Create catering service record if this is an event order
    if (body.event_type && body.event_date) {
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
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert([
              {
                name: body.customer_name,
                email: body.customer_email,
                phone: body.contact_number || body.phone || "",
                address: body.delivery_address || "",
              },
            ])
            .select()
            .single()

          if (!customerError && newCustomer) {
            customerId = newCustomer.id
          }
        }
      }

      const cateringData = {
        customer_id: customerId,
        customer_name: body.customer_name,
        event_type: body.event_type,
        event_date: body.event_date,
        guest_count: body.quantity || 1,
        status: "pending",
        location: body.delivery_address || "",
        special_requests: body.special_requests || body.special_instructions || "",
        order_id: order.id,
        location_id: locationId,
        payment_method: body.payment_method,
      }

      const { error: cateringError } = await supabase.from("catering_services").insert([cateringData])

      if (cateringError) {
        console.error("Error creating catering service:", cateringError)
        // Don't fail the order creation if catering service creation fails
      }
    }

    // Create payment record
    if (body.payment_method && body.total_amount) {
      const paymentData = {
        customer_name: body.customer_name,
        amount: body.total_amount,
        payment_method: body.payment_method,
        payment_date: new Date().toISOString().split("T")[0],
        status: "pending",
        order_id: order.id,
      }

      const { error: paymentError } = await supabase.from("payments").insert([paymentData])

      if (paymentError) {
        console.error("Error creating payment record:", paymentError)
        // Don't fail the order creation if payment record creation fails
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
