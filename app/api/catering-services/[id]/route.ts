import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: cateringService, error } = await supabase
      .from("catering_services")
      .select(`
        *,
        customers (
          name,
          email,
          phone
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching catering service:", error)
      return NextResponse.json({ error: "Catering service not found" }, { status: 404 })
    }

    return NextResponse.json(cateringService)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch catering service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()
    const body = await request.json()

    const { data: cateringService, error } = await supabase
      .from("catering_services")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating catering service:", error)
      return NextResponse.json({ error: "Failed to update catering service" }, { status: 500 })
    }

    return NextResponse.json(cateringService)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update catering service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("catering_services").delete().eq("id", id)

    if (error) {
      console.error("Error deleting catering service:", error)
      return NextResponse.json({ error: "Failed to delete catering service" }, { status: 500 })
    }

    return NextResponse.json({ message: "Catering service deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete catering service" }, { status: 500 })
  }
}
