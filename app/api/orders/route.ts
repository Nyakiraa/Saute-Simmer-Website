import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

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

    const orderData = await request.json()

    // Get customer record from our custom table
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", user.email)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: "Customer record not found" }, { status: 404 })
    }

    // Start a transaction by creating all related records

    // 1. Create location record
    const locationData = {
      name: `Event Location - ${orderData.eventType}`,
      address: orderData.deliveryAddress,
      city: "N/A", // Extract from address if needed
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
      return NextResponse.json({ error: "Failed to create location record" }, { status: 500 })
    }

    // 2. Create the main order record
    const mainOrderData = {
      customer_id: customer.id,
      order_date: new Date().toISOString(),
      total_amount: 0, // Will be updated after calculating items
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
      return NextResponse.json({ error: "Failed to create order record" }, { status: 500 })
    }

    // 3. Create payment record (pending payment)
    const paymentData = {
      order_id: mainOrder.id,
      amount: 0, // Will be updated with actual amount
      payment_method: "pending",
      payment_status: "pending",
      transaction_id: `TXN-${mainOrder.id}-${Date.now()}`,
      payment_date: null, // Will be set when payment is completed
      created_at: new Date().toISOString(),
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single()

    if (paymentError) {
      console.error("Error creating payment record:", paymentError)
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    // 4. Create the catering service record (linked to main order)
    const cateringServiceData = {
      customer_id: customer.id,
      customer_name: customer.name,
      event_type: orderData.eventType,
      event_date: orderData.eventDate,
      guest_count: orderData.quantity || 1,
      status: "pending",
      location: orderData.deliveryAddress,
      special_requests: orderData.specialRequests || "Custom meal selection",
      order_id: mainOrder.id, // Link to main order
      location_id: location.id, // Link to location
      created_at: new Date().toISOString(),
    }

    const { data: cateringService, error: cateringError } = await supabase
      .from("catering_services")
      .insert([cateringServiceData])
      .select()
      .single()

    if (cateringError) {
      console.error("Error creating catering service:", cateringError)
      return NextResponse.json({ error: "Failed to create catering service record" }, { status: 500 })
    }

    // Calculate total amount (for custom orders, this would be based on selected items)
    const estimatedAmount = (orderData.quantity || 1) * 500 // Base price for custom meals

    // Update the main order with total amount
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        total_amount: estimatedAmount,
      })
      .eq("id", mainOrder.id)

    if (updateOrderError) {
      console.error("Error updating order amount:", updateOrderError)
    }

    // Update payment with amount
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        amount: estimatedAmount,
      })
      .eq("id", payment.id)

    if (updatePaymentError) {
      console.error("Error updating payment amount:", updatePaymentError)
    }

    return NextResponse.json({
      success: true,
      order: {
        ...mainOrder,
        total_amount: estimatedAmount,
        catering_service: cateringService,
        location: location,
        payment: {
          ...payment,
          amount: estimatedAmount,
        },
      },
      message: "Custom meal order placed successfully",
    })
  } catch (error) {
    console.error("Error in custom order creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
