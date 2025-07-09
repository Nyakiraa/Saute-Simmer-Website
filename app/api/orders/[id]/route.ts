import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: order, error } = await supabase.from("orders").select("*").eq("id", Number.parseInt(id)).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      console.error("Error fetching order:", error)
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: order, error } = await supabase
      .from("orders")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      console.error("Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("orders").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting order:", error)
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
    }

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
