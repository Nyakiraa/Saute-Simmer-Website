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

    // Get meal set details
    const { data: mealSet, error: mealSetError } = await supabase
      .from("meal_sets")
      .select("*")
      .eq("id", orderData.mealSetId)
      .single()

    if (mealSetError || !mealSet) {
      return NextResponse.json({ error: "Meal set not found" }, { status: 404 })
    }

    // Create the catering service order for meal set
    const cateringServiceData = {
      customer_id: customer.id,
      customer_name: customer.name,
      event_type: orderData.eventType,
      event_date: orderData.eventDate,
      guest_count: orderData.quantity || 1,
      status: "pending",
      location: orderData.deliveryAddress,
      special_requests: `Meal Set: ${mealSet.name} (${mealSet.type}) - Quantity: ${orderData.quantity}${
        orderData.specialRequests ? ` | Additional Requests: ${orderData.specialRequests}` : ""
      }`,
    }

    const { data: cateringService, error: cateringError } = await supabase
      .from("catering_services")
      .insert([cateringServiceData])
      .select()
      .single()

    if (cateringError) {
      console.error("Error creating catering service:", cateringError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order: cateringService,
      mealSet: mealSet,
      message: "Meal set order placed successfully",
    })
  } catch (error) {
    console.error("Error in meal set order creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
