import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: service, error } = await supabase
      .from("catering_services")
      .select("*")
      .eq("id", Number.parseInt(id))
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      console.error("Error fetching service:", error)
      return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: service, error } = await supabase
      .from("catering_services")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      console.error("Error updating service:", error)
      return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("catering_services").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting service:", error)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
