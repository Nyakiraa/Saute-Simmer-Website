import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))

    if (userError || !user) {
      console.error("User authentication failed:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Creating meal set order with data:", body)

    // Validate required fields
    if (
      !body.meal_set_id ||
      !body.quantity ||
      !body.event_type ||
      !body.event_date ||
      !body.delivery_address ||
      !body.payment_method
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["meal_set_id", "quantity", "event_type", "event_date", "delivery_address", "payment_method"],
          received: Object.keys(body),
        },
        { status: 400 },
      )
    }

    // Get meal set details
    const { data: mealSet, error: mealSetError } = await supabase
      .from("meal_sets")
      .select("*")
      .eq("id", body.meal_set_id)
      .single()

    if (mealSetError || !mealSet) {
      console.error("Error fetching meal set:", mealSetError)
      return NextResponse.json({ error: "Meal set not found" }, { status: 404 })
    }

    // First, ensure customer exists
    let customer
    const { data: existingCustomer, error: customerFetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerFetchError && customerFetchError.code !== "PGRST116") {
      console.error("Error fetching customer:", customerFetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingCustomer) {
      customer = existingCustomer
      console.log("Found existing customer:", customer.id)
    } else {
      // Create new customer
      const customerData = {
        name:
          body.contact_person ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Unknown",
        email: user.email,
        phone: body.contact_number || null,
        address: body.delivery_address,
      }

      console.log("Creating new customer:", customerData)

      const { data: newCustomer, error: customerCreateError } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single()

      if (customerCreateError) {
        console.error("Error creating customer:", customerCreateError)
        return NextResponse.json({ error: "Failed to create customer", details: customerCreateError }, { status: 500 })
      }
      customer = newCustomer
      console.log("Created new customer:", customer.id)
    }

    // Create location record for delivery address
    let locationId = null
    const { data: newLocation, error: locationError } = await supabase
      .from("locations")
      .insert({
        name: `${customer.name}'s Event Location`,
        address: body.delivery_address,
        status: "active",
        country: "Philippines",
      })
      .select("id")
      .single()

    if (!locationError) {
      locationId = newLocation.id
      console.log("Created location:", locationId)
    } else {
      console.error("Error creating location:", locationError)
    }

    // Calculate total amount
    const totalAmount = mealSet.price * body.quantity

    // Create the order
    const orderData = {
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      order_type: "meal_set",
      meal_set_id: body.meal_set_id,
      meal_set_name: mealSet.name,
      quantity: body.quantity,
      total_amount: totalAmount,
      event_type: body.event_type,
      event_date: body.event_date,
      delivery_address: body.delivery_address,
      location_id: locationId, // Connect to location
      contact_person: body.contact_person || customer.name,
      contact_number: body.contact_number,
      payment_method: body.payment_method,
      special_requests: body.special_requests,
      status: "pending",
      order_date: new Date().toISOString().split("T")[0],
    }

    console.log("Inserting order with data:", orderData)

    const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Failed to create order", details: orderError }, { status: 500 })
    }

    console.log("Order created successfully:", order)

    // Create catering service record
    const cateringData = {
      customer_id: customer.id,
      customer_name: customer.name,
      event_type: body.event_type,
      event_date: body.event_date,
      guest_count: body.quantity,
      status: "pending",
      location: body.delivery_address,
      special_requests: body.special_requests || "",
      order_id: order.id, // Connect to order
      location_id: locationId, // Connect to location
      payment_method: body.payment_method,
    }

    console.log("Creating catering service record:", cateringData)

    const { data: cateringService, error: cateringError } = await supabase
      .from("catering_services")
      .insert([cateringData])
      .select()
      .single()

    if (cateringError) {
      console.error("Error creating catering service:", cateringError)
    } else {
      console.log("Created catering service:", cateringService.id)
    }

    // Create payment record
    const paymentData = {
      order_id: order.id,
      customer_id: customer.id,
      customer_name: customer.name,
      amount: totalAmount,
      payment_method: body.payment_method,
      transaction_id: `TXN-${order.id}-${Date.now()}`,
      payment_date: new Date().toISOString(),
      status: "pending",
    }

    console.log("Creating payment record:", paymentData)

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single()

    if (paymentError) {
      console.error("Error creating payment:", paymentError)
      // Don't fail the order creation if payment record fails
    } else {
      console.log("Created payment record:", payment.id)
    }

    return NextResponse.json(
      {
        success: true,
        order,
        catering_service: cateringService,
        location_id: locationId,
        payment,
        message: "Meal set order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating meal set order:", error)
    return NextResponse.json({ error: "Failed to create order", details: error }, { status: 500 })
  }
}
