import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const id = params.id

    const { data, error } = await supabase
      .from("payments")
      .update({
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        amount: body.amount,
        payment_method: body.payment_method,
        status: body.status,
        payment_date: body.payment_date,
        notes: body.notes,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating payment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
