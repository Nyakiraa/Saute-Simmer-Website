import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: payment, error } = await supabase.from("payments").select("*").eq("id", Number.parseInt(id)).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }
      console.error("Error fetching payment:", error)
      return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: payment, error } = await supabase
      .from("payments")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }
      console.error("Error updating payment:", error)
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("payments").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting payment:", error)
      return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
    }

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
