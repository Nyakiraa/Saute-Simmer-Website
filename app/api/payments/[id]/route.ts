import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { data: payment, error } = await supabase
      .from("payments")
      .select(`
        *,
        customers (
          name,
          email,
          phone
        ),
        orders (
          id,
          order_type,
          total_amount,
          status
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching payment:", error)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: payment, error } = await supabase.from("payments").update(body).eq("id", params.id).select().single()

    if (error) {
      console.error("Error updating payment:", error)
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from("payments").delete().eq("id", params.id)

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
