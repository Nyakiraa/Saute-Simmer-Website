import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payments:", error)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: payment, error } = await supabase.from("payments").insert([body]).select().single()

    if (error) {
      console.error("Error creating payment:", error)
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
