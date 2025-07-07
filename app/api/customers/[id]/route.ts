import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", Number.parseInt(id))
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }
      console.error("Error fetching customer:", error)
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: customer, error } = await supabase
      .from("customers")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }
      console.error("Error updating customer:", error)
      return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("customers").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting customer:", error)
      return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
    }

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
