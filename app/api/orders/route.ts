import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Custom Order API Called ===")

    const authHeader = request.headers.get("authorization")
    console.log("Auth header present:", !!authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header")
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabase = createServerClient()

    // Verify the token and get user
    console.log("Verifying user token...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!user) {
      console.log("No user found from token")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    console.log("User authenticated:", user.email)

    const orderData = await request.json()
    console.log("Order data received:", orderData)

    // Get customer record from our custom table
    console.log("Looking up customer by email:", user.email)
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerError) {
      console.error("Customer lookup error:", customerError)
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 })
    }

    if (!customer) {
      console.log("No customer record found")
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 })
    }

    console.log("Customer found:", customer.name)

    // Validate required fields
    if (!orderData.eventType || !orderData.eventDate || !orderData.deliveryAddress) {
      console.log("Missing required fields:", {
        eventType: !!orderData.eventType,
        eventDate: !!orderData.eventDate,
        deliveryAddress: !!orderData.deliveryAddress,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate estimated amount for custom orders
    const estimatedAmount = (orderData.quantity || 1) * 500 // Base price for custom meals

    // Start creating records in sequence
    console.log("Creating location record...")

    // 1. Create location record
    const locationData = {
      name: `Event Location - ${orderData.eventType}`,
      address: orderData.deliveryAddress,
      city: "N/A",
      state: "N/A",
      zip_code: "N/A",
      country: "Philippines",
      created_at: new Date().toISOString(),
    }

    const { data: location, error: locationError } = await supabase
      .from("locations")
      .insert([locationData])
      .select()
      .single()

    if (locationError) {
      console.error("Error creating location:", locationError)
      return NextResponse.json(
        {
          error: "Failed to create location record",
          details: locationError.message,
        },
        { status: 500 },
      )
    }

    console.log("Location created with ID:", location.id)

    // 2. Create the main order record
    console.log("Creating main order record...")
    const mainOrderData = {
      customer_id: customer.id,
      order_date: new Date().toISOString(),
      total_amount: estimatedAmount,
      status: "pending",
      delivery_date: orderData.eventDate,
      delivery_address: orderData.deliveryAddress,
      special_instructions: orderData.specialRequests || "Custom meal selection",
      created_at: new Date().toISOString(),
    }

    const { data: mainOrder, error: orderError } = await supabase
      .from("orders")
      .insert([mainOrderData])
      .select()
      .single()

    if (orderError) {
      console.error("Error creating main order:", orderError)
      // Clean up location if order creation fails
      await supabase.from("locations").delete().eq("id", location.id)
      return NextResponse.json(
        {
          error: "Failed to create order record",
          details: orderError.message,
        },
        { status: 500 },
      )
    }

    console.log("Main order created with ID:", mainOrder.id)

    // 3. Create payment record
    console.log("Creating payment record...")
    const paymentData = {
      order_id: mainOrder.id,
      amount: estimatedAmount,
      payment_method: "pending",
      payment_status: "pending",
      transaction_id: `TXN-${mainOrder.id}-${Date.now()}`,
      payment_date: null,
      created_at: new Date().toISOString(),
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single()

    if (paymentError) {
      console.error("Error creating payment record:", paymentError)
      // Clean up previous records if payment creation fails
      await supabase.from("orders").delete().eq("id", mainOrder.id)
      await supabase.from("locations").delete().eq("id", location.id)
      return NextResponse.json(
        {
          error: "Failed to create payment record",
          details: paymentError.message,
        },
        { status: 500 },
      )
    }

    console.log("Payment record created with ID:", payment.id)

    // 4. Create the catering service record (linked to main order and location)
    console.log("Creating catering service record...")
    const cateringServiceData = {
      customer_id: customer.id,
      customer_name: customer.name,
      event_type: orderData.eventType,
      event_date: orderData.eventDate,
      guest_count: orderData.quantity || 1,
      status: "pending",
      location: orderData.deliveryAddress,
      special_requests: orderData.specialRequests || "Custom meal selection",
      order_id: mainOrder.id,
      location_id: location.id,
      created_at: new Date().toISOString(),
    }

    const { data: cateringService, error: cateringError } = await supabase
      .from("catering_services")
      .insert([cateringServiceData])
      .select()
      .single()

    if (cateringError) {
      console.error("Error creating catering service:", cateringError)
      // Clean up all previous records if catering service creation fails
      await supabase.from("payments").delete().eq("id", payment.id)
      await supabase.from("orders").delete().eq("id", mainOrder.id)
      await supabase.from("locations").delete().eq("id", location.id)
      return NextResponse.json(
        {
          error: "Failed to create catering service record",
          details: cateringError.message,
        },
        { status: 500 },
      )
    }

    console.log("Catering service created with ID:", cateringService.id)
    console.log("=== Custom Order Created Successfully ===")

    return NextResponse.json({
      success: true,
      order: {
        ...mainOrder,
        catering_service: cateringService,
        location: location,
        payment: payment,
      },
      message: "Custom meal order placed successfully",
    })
  } catch (error) {
    console.error("=== Custom Order API Error ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
